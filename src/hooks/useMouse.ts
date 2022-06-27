import { usePinch } from '@use-gesture/react';
import { fabric } from 'fabric';
import { useRef } from 'react';
import { useStore } from 'zustand';
import { Point } from '../classes/Geometry/Point';
import { LabelType } from '../classes/Label';
import { PolygonLabel } from '../classes/Label/PolygonLabel';
import {
  BREAKPOINT_DEFAULT_OPTIONS,
  deleteCursor,
  LINE_DEFAULT_CONFIG,
  NEW_CATEGORY_NAME,
  POINT_DEFAULT_CONFIG,
  POLYLINE_DEFAULT_OPTIONS,
  RADIUS,
  STROKE_WIDTH,
  TRANSPARENT,
} from '../interfaces/config';
import {
  CanvasMetaStore,
  CanvasMetaStoreProps,
} from '../stores/CanvasMetaStore';
import { CanvasStore, CanvasStoreProps } from '../stores/CanvasStore';
import { ColorStore, ColorStoreProps } from '../stores/ColorStore';
import { CVStore, CVStoreProps } from '../stores/CVStore';
import { ImageMetaStore, ImageMetaStoreProps } from '../stores/ImageMetaStore';
import { SelectionStore, SelectionStoreProps } from '../stores/SelectionStore';
import { getBetween, isInvalid } from '../utils';
import {
  isEndpoint,
  isLine,
  isMidpoint,
  isPoint,
  isPolygon,
  isPolygonEndpoint,
  isPolygonLine,
  isRect,
  newLabel,
  updateCoords,
  updateEndpointAssociatedLinesPosition,
} from '../utils/label';

export const useMouse = (syncCanvasToState: () => void) => {
  const lastPosition = useRef<Point>(new Point());
  const lastRightClickSelection = useRef<fabric.Object | null>(null);
  const isPanning = useRef<boolean>(false);
  const onDrawObj = useRef<fabric.Object | null>(null);
  const onAlterObj = useRef<fabric.Object | null>(null);
  const onConfirmDelete = useRef<Function | null>(null);

  const curState = useStore(CanvasStore, (s: CanvasStoreProps) => s.curState());

  const cv = window['cv'];
  const { intelligentScissor, initIntelligentScissor } = useStore(
    CVStore,
    (s: CVStoreProps) => s
  );

  const { canvas, initDims: canvasInitDims } = useStore(
    CanvasMetaStore,
    (s: CanvasMetaStoreProps) => s
  );

  const {
    boundary: imageBoundary,
    scale,
    offset,
  } = useStore(ImageMetaStore, (s: ImageMetaStoreProps) => s);

  const {
    drawType,
    AIMode,
    setDrawType,
    objects: selectedObjects,
    category: selectedCategory,
    isSelected,
    selectObjects,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  const getColor = useStore(ColorStore, (s: ColorStoreProps) => s.getColor);

  // mount gestures event listener
  usePinch(() => {}, { target: canvas?.getElement().parentElement! });

  if (!canvas) return {};

  /**
   * If it is a point / endpoint, swap its fill color and stroke color
   * @param obj moving object
   */
  const setHoverEffectOfEndpoint = (obj: fabric.Object) => {
    if (isPoint(obj) || isEndpoint(obj))
      obj.set({ fill: obj.stroke, stroke: obj.fill as string });
  };

  /**
   * Calculate and set canvas's zoom scale based on mouse wheel event
   * @param evt wheel event
   * @returns
   */
  const setZoomByWheel = (evt: WheelEvent) => {
    const { deltaY, offsetX: x, offsetY: y } = evt;

    // make touchBoard more smooth, using ctrlKey to identify touchBoard
    // more detail in: https://use-gesture.netlify.app/docs/options/#modifierkey
    const delta = deltaY * (evt.ctrlKey ? 3 : 1);
    const zoom = getBetween(canvas.getZoom() * 0.999 ** delta, 0.01, 20);
    canvas.zoomToPoint({ x, y }, zoom);
  };

  /**
   *
   * @param zoom zoom scale
   * @param offset cursor offset after panning
   */
  const setViewport = (offset: Point = new Point()) => {
    const zoom = canvas.getZoom();
    const [w, h] = [canvas.width!, canvas.height!];
    const { x, y } = offset;
    const vpt = canvas.viewportTransform as number[];
    const offsetX = w - canvasInitDims!.w * zoom;
    const offsetY = h - canvasInitDims!.h * zoom;
    vpt[4] = offsetX > 0 ? offsetX / 2 : getBetween(vpt[4] + x, offsetX, 0);
    vpt[5] = offsetY > 0 ? offsetY / 2 : getBetween(vpt[5] + y, offsetY, 0);
    canvas.requestRenderAll();
  };

  /**
   * add midpoint to the polygon via regenerate it
   * @param midpoint clicked midpoint
   */
  const addPointToPolygon = (midpoint: fabric.Circle) => {
    const { left, top, _id, polygon } = midpoint as any;
    polygon.points.splice(_id + 1, 0, new Point(left, top)); // update polygon's points

    const oldObjs = canvas.getObjects().filter((o: any) => o.id === polygon.id);
    const newObjs = new PolygonLabel({
      obj: polygon,
      scale,
      offset,
    }).getFabricObjects(getColor(polygon.category), false);

    // the replace would not happen immediately,  associate them for convenience.
    const theEndpoint = newObjs.find(
      (o: any) => o._id === _id + 1 && o.type === 'circle'
    );
    (midpoint as any).set({ hoverCursor: 'move', counterpart: theEndpoint });

    canvas.remove(...oldObjs).add(...newObjs);
  };

  /**
   * delete the polygon's endpoint via regeneratation
   * @param endpoint the endpoint of polygon which want to delete
   */
  const deleteEndpointOfPolygon = (endpoint: fabric.Circle) => {
    const { polygon, _id } = endpoint as any;

    if (polygon.points.length > 3) {
      polygon.points.splice(_id, 1);
      const oldObjs = canvas
        .getObjects()
        .filter((o: any) => o.id === polygon.id);
      const newObjs = new PolygonLabel({
        obj: polygon,
        scale,
        offset,
      }).getFabricObjects(getColor(polygon.category), false);

      canvas.remove(...oldObjs).add(...newObjs);
    }
  };

  /**
   * Parse the mouse event and process the detail
   * @param e MouseEvent or WheelEvent
   * @param debugMode log the detail of mouse event to the console
   * @returns
   */
  function parseEvent<T extends MouseEvent | WheelEvent>(
    e: fabric.IEvent<T>,
    debugMode: boolean = false
  ) {
    if (debugMode) console.log(e);
    const { button, target, pointer: poi, e: evt } = e;
    evt.preventDefault();
    evt.stopPropagation();
    const cursor = new Point(imageBoundary.within(canvas?.getPointer(evt)!));
    const pointer = new Point(poi);

    return { target, evt, button, pointer, cursor };
  }

  /**
   *
   * @param end terminal point of the path
   * @returns the points of the path which intelligent scissor recommended
   */
  const getPointsOfPathFromIntelligentScissor = (end: Point) => {
    let contour = new cv.Mat();
    try {
      intelligentScissor.getContour(end, contour);
      cv.approxPolyDP(contour, contour, 0.01 * contour.rows, false);
    } catch (e) {
      onAlterObj.current = null;
    }
    const _points: number[] = Array.from(contour.data32S);
    const points = [];
    while (_points.length) {
      const [x, y] = _points.splice(0, 2);
      points.push(new Point(x, y).zoom(scale).translate(offset));
    }
    contour.delete();

    return points;
  };

  const drawingStart = (event: fabric.IEvent<MouseEvent>) => {
    console.log('drawingStart');

    const { cursor } = parseEvent(event);
    lastPosition.current = cursor;

    const category = selectedCategory || NEW_CATEGORY_NAME;
    const id = Math.max(-1, ...curState.map(({ id }) => id)) + 1;
    const color = getColor(category);

    const fabricObjects = newLabel({
      labelType: drawType,
      position: cursor,
      category,
      id,
      scale,
      offset,
    }).getFabricObjects(color, false);

    onDrawObj.current = fabricObjects[0];

    if (AIMode) {
      if (drawType === LabelType.Polygon) {
        const thePoint = cursor.translate(offset.inverse()).zoom(1 / scale);
        intelligentScissor.buildMap(thePoint);
        canvas.add(...fabricObjects.slice(2)); // add two generated points
      }
    } else canvas.add(...fabricObjects);
  };

  const drawOnMouseMove = (event: fabric.IEvent<MouseEvent>) => {
    console.log('drawOnMouseMove');

    if (drawType === LabelType.None) return drawingStop();
    const obj = onDrawObj.current as any;
    if (!obj) return;

    const { cursor } = parseEvent(event);
    const { x: nowX, y: nowY } = cursor;
    const { x: lastX, y: lastY } = lastPosition.current;

    if (isRect(obj)) {
      const left = Math.min(lastX, nowX);
      const top = Math.min(lastY, nowY);
      const right = Math.max(lastX, nowX) - STROKE_WIDTH; // width and height will add stroke width automatically so we need to subtract it
      const bottom = Math.max(lastY, nowY) - STROKE_WIDTH;
      obj.set({ left, top, width: right - left, height: bottom - top });
    } else if (isPoint(obj)) {
      obj.set({ left: nowX, top: nowY });
    } else if (isLine(obj) || isPolygon(obj)) {
      const { points, endpoints } = obj;
      const lastEndpoint = endpoints[endpoints.length - 1];
      lastEndpoint.set({ left: nowX, top: nowY });
      if (AIMode && drawType === LabelType.Polygon) {
        const thePoint = cursor.translate(offset.inverse()).zoom(1 / scale);
        const points = getPointsOfPathFromIntelligentScissor(thePoint);
        const newPolyline = new fabric.Polyline(points, {
          ...POLYLINE_DEFAULT_OPTIONS,
          stroke: obj.fill,
          fill: TRANSPARENT,
        });
        const oldPolyline = canvas.getObjects('polyline').slice(-1)[0];
        canvas.remove(oldPolyline).add(newPolyline);
      } else {
        updateEndpointAssociatedLinesPosition(lastEndpoint);
        if (points) points[points.length - 1] = new Point(nowX, nowY);
      }
    }

    canvas.requestRenderAll();
  };

  const drawingBreak = (event: fabric.IEvent<MouseEvent>) => {
    console.log('drawingBreak');
    const obj = onDrawObj.current as any;
    const { cursor } = parseEvent(event);
    const { x: left, y: top } = cursor;

    if (isPolygon(obj)) {
      const { points, endpoints, labelType, category, id } = obj;
      const color = getColor(category);
      const currentPolyline = canvas
        .getObjects('polyline')
        .slice(-1)[0] as fabric.Polyline;

      if (cursor.distanceFrom(points[0]) < RADIUS) {
        if (AIMode) {
          points.push.apply(points, [...currentPolyline.points?.slice(1, -1)!]);
        } else points.pop();

        const newFabricObjs = new PolygonLabel({
          obj,
          scale,
          offset,
        }).getFabricObjects(color, false);
        canvas
          .remove(...canvas.getObjects().filter((o: any) => o.id === id))
          .add(...newFabricObjs);
        drawingStop();
      } else {
        if (AIMode) {
          points.push.apply(points, [...currentPolyline.points?.slice(1)!]);

          const thePoint = cursor.translate(offset.inverse()).zoom(1 / scale);
          intelligentScissor.buildMap(thePoint);

          const breakpoint = new fabric.Circle({
            ...BREAKPOINT_DEFAULT_OPTIONS,
            left,
            top,
            fill: obj.fill,
          });
          breakpoint.setOptions({ id });
          const cachePolyline = new fabric.Polyline([cursor], { id } as any);
          canvas.add(breakpoint, cachePolyline);
        } else {
          points.push(cursor);
          const newEndpoint = new fabric.Circle({
            ...POINT_DEFAULT_CONFIG,
            left,
            top,
            fill: color,
            stroke: TRANSPARENT,
            selectable: false,
          });
          newEndpoint.setOptions({
            labelType,
            id,
            _id: endpoints.length,
            lines: [],
          });
          endpoints.push(newEndpoint);
          const endpointsOfNewLine = endpoints.slice(
            endpoints.length - 2,
            endpoints.length
          );
          const newLine = new fabric.Line([left, top, left, top], {
            ...LINE_DEFAULT_CONFIG,
            stroke: color,
          });
          newLine.setOptions({ id, endpoints: endpointsOfNewLine });
          endpointsOfNewLine.forEach((endpoint: fabric.Circle) => {
            (endpoint as any).lines.push(newLine);
          });

          canvas.add(newEndpoint, newLine);
        }
      }
      updateCoords(obj);
    } else drawingStop();
  };

  const drawingStop = () => {
    console.log('drawingStop');
    const obj = onDrawObj.current as any;

    if (isInvalid(obj) || drawType === LabelType.None)
      canvas.remove(...canvas.getObjects().filter((o: any) => o.id === obj.id));
    else {
      updateCoords(obj);
      selectObjects([newLabel({ obj, offset, scale })]);
      isRect(obj) && canvas.setActiveObject(obj);
      syncCanvasToState();
    }

    onDrawObj.current = null;
    setDrawType();
  };

  const alterStart = (event: fabric.IEvent<MouseEvent>) => {
    console.log('alterStart');

    const { target, cursor } = parseEvent(event);
    if (target && isPolygonEndpoint(target) && !onAlterObj.current) {
      onAlterObj.current = target;
      const thePoint = cursor.translate(offset.inverse()).zoom(1 / scale);
      intelligentScissor.buildMap(thePoint);
      (target as any).polygon.endpoints.forEach((ep: any) =>
        ep.set({ selectable: false })
      );
    }
  };

  const alterRecommend = (event: fabric.IEvent<MouseEvent>) => {
    console.log('alterRecommend');

    const { cursor } = parseEvent(event);
    const obj = onAlterObj.current as any;
    const color = getColor(obj.category);
    const thePoint = cursor.translate(offset.inverse()).zoom(1 / scale);
    const points = getPointsOfPathFromIntelligentScissor(thePoint);

    const polyline = new fabric.Polyline(points, {
      ...POLYLINE_DEFAULT_OPTIONS,
      stroke: color,
      fill: TRANSPARENT,
    });
    const lastPolyline = canvas.getObjects('polyline').slice(-1)[0];
    canvas.remove(lastPolyline).add(polyline);
  };

  const alterBreak = (event: fabric.IEvent<MouseEvent>) => {
    console.log('alterBreak');

    const { target, cursor } = parseEvent(event);
    const obj = onAlterObj.current as any;
    const color = getColor(obj.category);

    if (target && (target as any).id === obj.id) alterStop(target);
    else {
      const { x: left, y: top } = cursor;
      const thePoint = cursor.translate(offset.inverse()).zoom(1 / scale);
      intelligentScissor.buildMap(thePoint);
      const breakpoint = new fabric.Circle({
        ...BREAKPOINT_DEFAULT_OPTIONS,
        left,
        top,
        fill: color,
      });
      const cachePolyline = new fabric.Polyline([cursor]);
      canvas.add(breakpoint, cachePolyline);
    }
  };

  const alterStop = (endBreakpoint: any) => {
    console.log('alterStop');
    const startBreakpoint = onAlterObj.current as any;
    const {
      polygon: { lines, points },
      category,
      id,
    } = endBreakpoint;

    // with the in-order path of the polygon
    const isSameDirection = startBreakpoint._id > endBreakpoint._id;

    const [min_id, max_id] = isSameDirection
      ? [endBreakpoint._id, startBreakpoint._id]
      : [startBreakpoint._id, endBreakpoint._id];

    // the path in same direction, which was separated via the start-breakpoint and the end-breakpoint
    const pointOfPath_1 = points.slice(min_id + 1, max_id);
    const pointOfPath_2 = [...points, ...points]
      .slice(max_id + 1, min_id + points.length)
      .reverse();

    const polylines = canvas.getObjects('polyline') as fabric.Polyline[];
    const pointsOfPolyline = polylines
      .map((pl: fabric.Polyline) => pl.points?.slice(0, -1))
      .flat();
    pointsOfPolyline.push(
      new fabric.Point(endBreakpoint.left, endBreakpoint.top)
    );

    const pointsOfPolygon_1 = [
      ...pointsOfPolyline,
      ...(isSameDirection ? pointOfPath_1 : pointOfPath_1.reverse()),
    ];

    const pointsOfPolygon_2 = [
      ...pointsOfPolyline,
      ...(isSameDirection ? pointOfPath_2 : pointOfPath_2.reverse()),
    ];

    const ObjsOfPath_1: fabric.Line[] = [];
    const ObjsOfPath_2: fabric.Line[] = [];

    (lines as fabric.Line[]).forEach((line, _id) => {
      if (_id >= min_id && _id < max_id)
        ObjsOfPath_1.push(line, ...(line as any).endpoints);
      else ObjsOfPath_2.push(line, ...(line as any).endpoints);
    });

    const onOver = (e: fabric.IEvent<MouseEvent>) => {
      const { target } = parseEvent(e) as any;
      const objs = ObjsOfPath_1.includes(target) ? ObjsOfPath_1 : ObjsOfPath_2;

      objs.forEach((o: any) => {
        o.set({ opacity: 0.5 });
      });
    };

    const onOut = (e: fabric.IEvent<MouseEvent>) => {
      const { target } = parseEvent(e) as any;
      const objs = ObjsOfPath_1.includes(target) ? ObjsOfPath_1 : ObjsOfPath_2;

      objs.forEach((o: any) => {
        o.set({ opacity: 1 });
      });
    };

    const hoverCursor = deleteCursor;

    [...ObjsOfPath_1, ...ObjsOfPath_2].forEach((o: any) => {
      o.setOptions({ hoverCursor, onOver, onOut });
    });

    onConfirmDelete.current = (e: fabric.IEvent<MouseEvent>) => {
      const { target } = parseEvent(e) as any;
      const points = (
        ObjsOfPath_1.includes(target)
          ? pointsOfPolygon_2
          : ObjsOfPath_2.includes(target)
          ? pointsOfPolygon_1
          : []
      )
        .map(Object.values)
        .flat();

      if (!points.length) return;

      const oldObjs = canvas.getObjects().filter((o: any) => o.id === id);
      const newObjs = new PolygonLabel({
        points,
        category,
        id,
      }).getFabricObjects(getColor(category), false);

      canvas.remove(...oldObjs).add(...newObjs);
      syncCanvasToState();
      onConfirmDelete.current = null;
    };

    initIntelligentScissor(
      (canvas.backgroundImage as fabric.Image).getElement() as HTMLImageElement
    );
    onAlterObj.current = null;
  };

  const listeners = {
    'mouse:over': (e: fabric.IEvent<MouseEvent>) => {
      const { target: obj } = e as any;
      if (!obj) return;

      if (obj.onOver) obj.onOver(e);
      else if (!onDrawObj.current && !onAlterObj.current) {
        setHoverEffectOfEndpoint(obj);
        isSelected(obj.id) && isPolygonLine(obj) && canvas.add(obj.midpoint);
      }

      canvas.requestRenderAll();
    },

    'mouse:out': (e: fabric.IEvent<MouseEvent>) => {
      const { target: obj } = e as any;
      if (!obj) return;

      if (obj.onOut) obj.onOut(e);
      else if (!onDrawObj.current && !onAlterObj.current) {
        setHoverEffectOfEndpoint(obj);
        if (isPolygonLine(obj)) {
          const isMoveToMidpoint = (e as any).nextTarget === obj.midpoint;
          if (!isMoveToMidpoint) canvas.remove(obj.midpoint);
        } else if (isMidpoint(obj)) canvas.remove(obj);
      }

      canvas.requestRenderAll();
    },

    'mouse:wheel': (e: fabric.IEvent<WheelEvent>) => {
      const { evt } = parseEvent(e);
      setZoomByWheel(evt);
      setViewport();
    },

    'mouse:down': (e: fabric.IEvent<MouseEvent>) => {
      const { target, button, pointer } = parseEvent(e);

      if (button === 1) {
        // left click
        if (onDrawObj.current) drawingBreak(e);
        else if (onAlterObj.current) alterBreak(e);
        else if (onConfirmDelete.current) onConfirmDelete.current(e);
        else if (drawType) drawingStart(e);
        else if (isMidpoint(target)) addPointToPolygon(target as fabric.Circle);
        else if (!target) {
          lastPosition.current = pointer;
          selectedObjects.length && selectObjects();
          canvas.setCursor('grabbing');
          isPanning.current = true;
        } else if (AIMode) alterStart(e);
      } else if (button === 3) {
        // right click
        if (target) lastRightClickSelection.current = target;
      }
    },

    'mouse:move': (e: fabric.IEvent<MouseEvent>) => {
      const { pointer } = parseEvent(e);

      if (onDrawObj.current) drawOnMouseMove(e);
      else if (onAlterObj.current) alterRecommend(e);
      else if (isPanning.current) {
        const { x: nowX, y: nowY } = pointer;
        const { x: lastX, y: lastY } = lastPosition.current;
        const offset = new Point(nowX - lastX, nowY - lastY);
        setViewport(offset);
        canvas.setViewportTransform(canvas.viewportTransform as number[]);
        lastPosition.current = new Point(nowX, nowY);
        canvas.setCursor('grabbing');
      }
    },

    'mouse:up': (e: fabric.IEvent<MouseEvent>) => {
      const { target, button } = parseEvent(e);

      if (button === 1) {
        // left click
        if (onDrawObj.current && drawType === LabelType.Point) drawingStop();
        else if (isMidpoint(target)) syncCanvasToState();
        else if (isPanning.current) isPanning.current = false;
      } else if (button === 3) {
        // right click
        if (
          lastRightClickSelection.current === target &&
          isEndpoint(target) &&
          (target as any).polygon
        ) {
          deleteEndpointOfPolygon(target as fabric.Circle);
          syncCanvasToState();
        }
      }
    },
  };

  return listeners;
};
