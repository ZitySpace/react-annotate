import { usePinch } from '@use-gesture/react';
import { fabric } from 'fabric';
import { useRef } from 'react';
import { useStore } from 'zustand';
import { Point } from '../classes/Geometry/Point';
import { LabelType } from '../classes/Label';
import { PolygonLabel } from '../classes/Label/PolygonLabel';
import {
  BREAKPOINT_DEFAULT_OPTIONS,
  checkCursor,
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
  const operatingObj = useRef<fabric.Object | null>(null);

  const curState = useStore(CanvasStore, (s: CanvasStoreProps) => s.curState());

  const cv = window['cv'];
  const { intelligentScissor } = useStore(CVStore, (s: CVStoreProps) => s);

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
    operationStatus,
    setOperationStatus,
    objects: selectedObjects,
    category: selectedCategory,
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

  const setHoverEffectOfAdjustingPolygon = (obj: fabric.Object) => {
    if (isPolygon(obj)) obj.set({ opacity: obj.opacity === 1 ? 0.1 : 1 });
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
  const getPointsOfPathFromAI = (end: Point) => {
    let contour = new cv.Mat();
    try {
      intelligentScissor.getContour(end, contour);
      cv.approxPolyDP(contour, contour, 0.01 * contour.rows, false);
    } catch (e) {
      operatingObj.current = null;
      setOperationStatus('none');
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

  const getPointOnOriginalImage = (cursorInImage: Point) =>
    cursorInImage.translate(offset.inverse()).zoom(1 / scale);

  const drawing = {
    start: (cursorInImage: Point) => {
      console.log('drawing start');

      lastPosition.current = cursorInImage;
      const category = selectedCategory || NEW_CATEGORY_NAME;
      const id = Math.max(-1, ...curState.map(({ id }) => id)) + 1;
      const color = getColor(category);

      const fabricObjects = newLabel({
        labelType: drawType,
        position: cursorInImage,
        category,
        id,
        scale,
        offset,
      }).getFabricObjects(color, false);

      if (AIMode) {
        if (drawType === LabelType.Polygon) {
          const pointOnOriginalImage = getPointOnOriginalImage(cursorInImage);
          intelligentScissor.buildMap(pointOnOriginalImage);
          canvas.add(...fabricObjects.slice(2)); // add two generated points
        } else return drawing.stop(); // other types are not currently supported
      } else canvas.add(...fabricObjects);

      operatingObj.current = fabricObjects[0];
      setOperationStatus('drawing');
    },

    move: (cursorInImage: Point) => {
      console.log('drawing move');

      if (drawType === LabelType.None) return drawing.stop();
      const drawingObj = operatingObj.current as any;
      const { x: nowX, y: nowY } = cursorInImage;
      const { x: lastX, y: lastY } = lastPosition.current;

      switch (drawingObj.type) {
        case 'rect':
          const left = Math.min(lastX, nowX);
          const top = Math.min(lastY, nowY);
          const right = Math.max(lastX, nowX) - STROKE_WIDTH; // width and height will add stroke width automatically so we need to subtract it
          const bottom = Math.max(lastY, nowY) - STROKE_WIDTH;
          drawingObj.set({
            left,
            top,
            width: right - left,
            height: bottom - top,
          });
          break;

        case 'circle':
          drawingObj.set({ left: nowX, top: nowY });
          break;

        case 'line':
        case 'polygon':
          const { points, endpoints } = drawingObj;
          const lastEndpoint = endpoints[endpoints.length - 1];
          lastEndpoint.set({ left: nowX, top: nowY });
          if (AIMode && drawType === LabelType.Polygon) {
            const pointOnOriginalImg = getPointOnOriginalImage(cursorInImage);
            const points = getPointsOfPathFromAI(pointOnOriginalImg);
            const newPolyline = new fabric.Polyline(points, {
              ...POLYLINE_DEFAULT_OPTIONS,
              stroke: drawingObj.fill,
              fill: TRANSPARENT,
            });
            const oldPolyline = canvas.getObjects('polyline').slice(-1)[0];
            canvas.remove(oldPolyline).add(newPolyline);
          } else {
            updateEndpointAssociatedLinesPosition(lastEndpoint);
            if (points) points[points.length - 1] = new Point(nowX, nowY);
          }
          break;
      }

      canvas.requestRenderAll();
    },

    break: (cursorInImage: Point) => {
      console.log('drawing break');

      const obj = operatingObj.current as any;
      const { x: left, y: top } = cursorInImage;

      if (isPolygon(obj)) {
        const { points, endpoints, labelType, category, id } = obj;
        const color = getColor(category);
        const currentPolyline = canvas
          .getObjects('polyline')
          .slice(-1)[0] as fabric.Polyline;

        // stop drawing after process
        // because click the staring point of the polygon/path
        if (cursorInImage.distanceFrom(points[0]) < RADIUS) {
          // process the points of the polygon/path
          if (AIMode) {
            points.push.apply(points, [
              ...currentPolyline.points?.slice(1, -1)!,
            ]);
          } else points.pop();

          // replace objects generated while drawing with newly generated objects
          const oldObjs = canvas.getObjects().filter((o: any) => o.id === id);
          const newFabricObjs = new PolygonLabel({
            obj,
            scale,
            offset,
          }).getFabricObjects(color, false);
          canvas.remove(...oldObjs).add(...newFabricObjs);
          drawing.stop();

          // draw a new part of polygon in AI mode
        } else if (AIMode) {
          points.push.apply(points, [...currentPolyline.points?.slice(1)!]);

          const pointOnOriginalImage = getPointOnOriginalImage(cursorInImage);
          intelligentScissor.buildMap(pointOnOriginalImage);

          const breakpoint = new fabric.Circle({
            ...BREAKPOINT_DEFAULT_OPTIONS,
            left,
            top,
            fill: obj.fill,
          });
          breakpoint.setOptions({ id });
          const cachePolyline = new fabric.Polyline([cursorInImage], {
            id,
          } as any);
          canvas.add(breakpoint, cachePolyline);

          // draw a new part of polygon in normal mode
        } else {
          points.push(cursorInImage);
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
        updateCoords(obj);
      } else drawing.stop();
    },

    stop: () => {
      console.log('drawing stop');

      const obj = operatingObj.current as any;

      if (isInvalid(obj) || drawType === LabelType.None) {
        const oldObjs = canvas
          .getObjects()
          .filter((o: any) => o.id === obj?.id);
        canvas.remove(...oldObjs);
      } else {
        updateCoords(obj);
        selectObjects([newLabel({ obj, offset, scale })]);
        isRect(obj) && canvas.setActiveObject(obj);
        syncCanvasToState();
      }

      operatingObj.current = null;
      setDrawType();
      setOperationStatus('none');
    },
  };

  const adjusting = {
    start: (startingObject: fabric.Object, cursorInImage: Point) => {
      console.log('adjusting start');

      if (isPolygonEndpoint(startingObject)) {
        operatingObj.current = startingObject;
        setOperationStatus('adjusting');
        const pointOnOriginalImage = getPointOnOriginalImage(cursorInImage);
        intelligentScissor.buildMap(pointOnOriginalImage);
      }
      // else adjusting.stop(); // other types are not yet supported
    },

    move: (cursorInImage: Point) => {
      console.log('adjusting move');

      const pointOnOriginalImage = getPointOnOriginalImage(cursorInImage);
      const points = getPointsOfPathFromAI(pointOnOriginalImage);

      const newPolyline = new fabric.Polyline(points, {
        ...POLYLINE_DEFAULT_OPTIONS,
        stroke: getColor(selectedCategory as string),
        fill: TRANSPARENT,
      });
      const lastPolyline = canvas.getObjects('polyline').slice(-1)[0];
      canvas.remove(lastPolyline).add(newPolyline);
    },

    break: (event: fabric.IEvent<MouseEvent>) => {
      console.log('adjusting break');
      const { target, cursor: cursorInImage } = parseEvent(event);

      // click the generated polygon
      if (target instanceof fabric.Polygon) return adjusting.stop(target);

      // click the starting endpoint of the path
      if (!operatingObj.current) return;
      const {
        _id: starting_id,
        polygon: { points },
        category,
        id,
      } = operatingObj.current as any;
      const { x: left, y: top } = cursorInImage;
      const color = getColor(category);

      if (
        target instanceof fabric.Circle &&
        (target as any)?._id !== starting_id
      ) {
        const { _id: ending_id, left, top } = target as any;

        const isSameDirection = starting_id > ending_id; // with the id-continued path of the polygon
        const min_id = Math.min(starting_id, ending_id);
        const max_id = Math.max(starting_id, ending_id);

        // get the points of the path which was separated via two breakpoints and without them
        // these two path was staring from the min id point and ending at the max id point
        const pointOfPath = [
          [...points].slice(min_id + 1, max_id),
          [...points, ...points]
            .slice(max_id + 1, min_id + points.length)
            .reverse(),
        ];

        const polylines = canvas.getObjects('polyline') as fabric.Polyline[];
        const pointsOfPolyline: fabric.Point[] = polylines
          .map((pl: fabric.Polyline) => pl.points?.slice(0, -1)!)
          .flat();
        pointsOfPolyline.push(new fabric.Point(left, top));

        const pointsOfPolygons = pointOfPath.map((pop) =>
          pointsOfPolyline.concat(isSameDirection ? pop : pop.reverse())
        );

        const polygonLabels = pointsOfPolygons.map(
          (popg) =>
            new PolygonLabel({
              points: popg.map(Object.values).flat(),
              category,
              id,
            })
        );

        const polygons = polygonLabels
          .sort((a, b) => b.boundary.getSize() - a.boundary.getSize())
          .map((pgL) => pgL.getFabricObjects(color, true)[1] as fabric.Polygon)
          .map((p) => {
            p.opacity = 0.3;
            p.hoverCursor = checkCursor;
            return p;
          });

        canvas.add(...polygons);
        operatingObj.current = null;

        // click empty space to add part of the path
      } else {
        const pointOnOriginalImage = getPointOnOriginalImage(cursorInImage);
        intelligentScissor.buildMap(pointOnOriginalImage);
        const breakpoint = new fabric.Circle({
          ...BREAKPOINT_DEFAULT_OPTIONS,
          left,
          top,
          fill: getColor(selectedCategory as string),
        });
        const cachePolyline = new fabric.Polyline([cursorInImage]);
        canvas.add(breakpoint, cachePolyline);
      }
    },

    stop: (seletedPolygon: fabric.Polygon) => {
      console.log('adjustint stop');

      const { id, category } = seletedPolygon as any;
      const color = getColor(category);
      const oldObjs = canvas.getObjects().filter((o: any) => o.id === id);
      const newObjs = new PolygonLabel({
        obj: seletedPolygon,
        scale,
        offset,
      }).getFabricObjects(color);
      canvas.remove(...oldObjs).add(...newObjs);
      syncCanvasToState();
      setOperationStatus('none');
    },
  };

  const panning = {
    start: (curPosition: Point) => {
      console.log('panning start');

      lastPosition.current = curPosition;
      canvas.setCursor('grabbing');
      setOperationStatus('panning');
      selectedObjects.length && selectObjects(); // TODO: might be as a individual function
    },
    move: (curPosition: Point) => {
      console.log('panning move');

      const { x: nowX, y: nowY } = curPosition;
      const { x: lastX, y: lastY } = lastPosition.current;
      const offset = new Point(nowX - lastX, nowY - lastY);
      setViewport(offset);
      canvas.setViewportTransform(canvas.viewportTransform as number[]);
      lastPosition.current = new Point(nowX, nowY);
      canvas.setCursor('grabbing');
    },
    stop: () => {
      console.log('panning stop');

      operatingObj.current = null;
      setOperationStatus('none');
    },
  };

  const listeners = {
    'mouse:over': (e: fabric.IEvent<MouseEvent>) => {
      const { target } = e as any;
      console.log('mouse:over');

      if (operationStatus === 'adjusting')
        setHoverEffectOfAdjustingPolygon(target);
      else if (!operatingObj.current) {
        setHoverEffectOfEndpoint(target);
        isPolygonLine(target) && canvas.add(target.midpoint);
      }

      canvas.requestRenderAll();
    },

    'mouse:out': (e: fabric.IEvent<MouseEvent>) => {
      const { target } = e as any;
      console.log('mouse:out');

      if (operationStatus === 'adjusting') {
        setHoverEffectOfAdjustingPolygon(target);
      } else if (!operatingObj.current) {
        setHoverEffectOfEndpoint(target);
        if (isPolygonLine(target)) {
          const isMoveToMidpoint = (e as any).nextTarget === target.midpoint;
          if (!isMoveToMidpoint) canvas.remove(target.midpoint);
        } else if (isMidpoint(target)) canvas.remove(target);
      }

      canvas.requestRenderAll();
    },

    'mouse:wheel': (e: fabric.IEvent<WheelEvent>) => {
      const { evt } = parseEvent(e);
      setZoomByWheel(evt);
      setViewport();
    },

    'mouse:down': (e: fabric.IEvent<MouseEvent>) => {
      const { target, button, pointer, cursor } = parseEvent(e);

      if (button === 1) {
        if (operationStatus === 'none') {
          if (target) {
            if (isMidpoint(target)) addPointToPolygon(target as fabric.Circle);
            else if (AIMode) adjusting.start(target, cursor);
            else; // handle via canvas' listeners
          } else {
            if (drawType) drawing.start(cursor);
            else panning.start(pointer);
          }
        } else if (operationStatus === 'drawing') drawing.break(cursor);
        else if (operationStatus === 'adjusting') adjusting.break(e);
      }

      if (button === 3) {
        if (target) operatingObj.current = target;
      }
    },

    'mouse:move': (e: fabric.IEvent<MouseEvent>) => {
      const { pointer, cursor } = parseEvent(e);

      if (operationStatus === 'panning') panning.move(pointer);
      else if (operationStatus === 'drawing') drawing.move(cursor);
      else if (operationStatus === 'adjusting' && operatingObj.current)
        adjusting.move(cursor);
    },

    'mouse:up': (e: fabric.IEvent<MouseEvent>) => {
      const { target, button } = parseEvent(e);

      if (button === 1) {
        if (operationStatus === 'none' && isMidpoint(target))
          syncCanvasToState();
        else if (operationStatus === 'panning') panning.stop();
        else if (operationStatus === 'drawing' && drawType === LabelType.Point)
          drawing.stop();
      }

      if (button === 3) {
        if (
          operatingObj.current === target &&
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
