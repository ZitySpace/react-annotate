import { usePinch } from '@use-gesture/react';
import { fabric } from 'fabric';
import { useRef } from 'react';
import { useStore } from 'zustand';
import { Point } from '../classes/Geometry/Point';
import { LabelType } from '../classes/Label';
import { PolygonLabel } from '../classes/Label/PolygonLabel';
import {
  LINE_DEFAULT_CONFIG,
  NEW_CATEGORY_NAME,
  POINT_DEFAULT_CONFIG,
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
import { ImageMetaStore, ImageMetaStoreProps } from '../stores/ImageMetaStore';
import { SelectionStore, SelectionStoreProps } from '../stores/SelectionStore';
import { getBetween, isInvalid, isTouchEvent } from '../utils';
import {
  isEndpoint,
  isLine,
  isMidpoint,
  isPoint,
  isPolygon,
  isPolygonLine,
  isRect,
  newLabel,
  updateCoords,
  updateEndpointAssociatedLinesPosition,
} from '../utils/label';

export const useMouse = (syncCanvasToState: () => void) => {
  const lastPosition = useRef<Point>(new Point());
  const lastSelection = useRef<fabric.Object | null>(null);
  const isPanning = useRef<boolean>(false);
  const onDrawObj = useRef<fabric.Object | null>(null);

  const curState = useStore(CanvasStore, (s: CanvasStoreProps) => s.curState());

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
    setDrawType,
    objects: selectedObjects,
    category: selectedCategory,
    isSelected,
    selectObjects,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  const getColor = useStore(ColorStore, (s: ColorStoreProps) => s.getColor);

  // mount gestures event listener
  usePinch(() => {}, { target: canvas?.getElement().parentElement });

  if (!canvas) return {};

  /**
   * If it is a point / endpoint, swap its fill color and stroke color
   * @param obj moving object
   */
  const setHoverEffectOfEndpoint = (obj: fabric.Object) => {
    if (isPoint(obj) || isEndpoint(obj))
      obj.set({
        fill: obj.stroke,
        stroke: obj.fill as string,
      });
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
    polygon.points.splice(_id + 1, 0, new Point(left, top));

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

  const drawingStart = (event: fabric.IEvent) => {
    const { x, y } = imageBoundary.within(canvas.getPointer(event.e));
    lastPosition.current = new Point(x, y);

    const category = selectedCategory || NEW_CATEGORY_NAME;
    const id = Math.max(-1, ...curState.map(({ id }) => id)) + 1;
    const color = getColor(category);

    const fabricObjects = newLabel({
      labelType: drawType,
      position: new Point(x, y),
      category,
      id,
      scale,
      offset,
    }).getFabricObjects(color, false);

    canvas.add(...fabricObjects);
    onDrawObj.current = fabricObjects[0];
  };

  const drawOnMouseMove = (event: fabric.IEvent) => {
    if (drawType === LabelType.None) return drawingStop();

    const { x: nowX, y: nowY } = imageBoundary.within(
      canvas.getPointer(event.e)
    );
    const { x: lastX, y: lastY } = lastPosition.current;
    const obj = onDrawObj.current as any;
    if (!obj) return;

    if (isRect(obj)) {
      const left = Math.min(lastX, nowX);
      const top = Math.min(lastY, nowY);
      const right = Math.max(lastX, nowX) - STROKE_WIDTH; // width and height will add stroke width automatically so we need to subtract it
      const bottom = Math.max(lastY, nowY) - STROKE_WIDTH;
      obj.set({ left, top, width: right - left, height: bottom - top });
    } else if (isPoint(obj)) {
      const left = nowX;
      const top = nowY;
      obj.set({ left, top });
    } else if (isLine(obj) || isPolygon(obj)) {
      const left = nowX;
      const top = nowY;
      const { points, endpoints } = obj;
      const lastEndpoint = endpoints[endpoints.length - 1];
      lastEndpoint.set({ left, top });
      updateEndpointAssociatedLinesPosition(lastEndpoint);
      if (points) points[points.length - 1] = new Point(left, top);
    }
    canvas.requestRenderAll();
  };

  const drawingBreak = (event: fabric.IEvent) => {
    console.log('drawingBreak');
    const obj = onDrawObj.current as any;

    // for segmentation, drawing is not done in once
    if (isPolygon(obj)) {
      const { points, endpoints, lines, labelType, category, id } = obj;
      const color = getColor(category);
      const { left, top } = imageBoundary.within(canvas.getPointer(event.e));
      const nowPoint = new Point(left, top);

      if (nowPoint.distanceFrom(points[0]) < RADIUS) {
        // if the last click is close to the starting point, stop drawing
        // remove the last point because it is used to show the cursor and has no practical meaning
        points.pop();
        const newFabricObjs = new PolygonLabel({
          obj,
          scale,
          offset,
        }).getFabricObjects(color, false);
        canvas.remove(obj, ...endpoints, ...lines).add(...newFabricObjs);
        drawingStop();
      } else {
        points.push(nowPoint);
        const newEndpoint = new fabric.Circle({
          ...POINT_DEFAULT_CONFIG,
          left,
          top,
          fill: color,
          stroke: TRANSPARENT,
          selectable: false,
        });
        newEndpoint.setOptions({ _id: endpoints.length, lines: [] });
        endpoints.push(newEndpoint);

        const endpointsOfNewLine = endpoints.slice(
          endpoints.length - 2,
          endpoints.length
        );
        const newLine = new fabric.Line([left, top, left, top], {
          ...LINE_DEFAULT_CONFIG,
          stroke: color,
        });
        newLine.setOptions({ endpoints: endpointsOfNewLine });
        lines.push(newLine);
        endpointsOfNewLine.forEach((endpoint: fabric.Circle) => {
          (endpoint as any).lines.push(newLine);
        });
        const products = [newLine, newEndpoint];
        products.forEach((obj) => obj.setOptions({ labelType, category, id }));
        canvas.add(...products);
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
    canvas.renderAll();
  };

  const listeners = {
    'mouse:over': (e: fabric.IEvent<MouseEvent>) => {
      const obj = e.target;
      if (!obj) return;

      setHoverEffectOfEndpoint(obj);
      isSelected((obj as any).id) &&
        isPolygonLine(obj) &&
        canvas.add((obj as any).midpoint);

      canvas.requestRenderAll();
    },

    'mouse:out': (e: fabric.IEvent<MouseEvent>) => {
      const obj = e.target as fabric.Object;
      if (!obj) return;

      setHoverEffectOfEndpoint(obj);
      if (isPolygonLine(obj)) {
        const isMoveToMidpoint =
          (e as any).nextTarget === (obj as any).midpoint;
        if (!isMoveToMidpoint) canvas.remove((obj as any).midpoint);
      } else if (isMidpoint(obj)) canvas.remove(obj);

      canvas.requestRenderAll();
    },

    'mouse:wheel': (event: fabric.IEvent<WheelEvent>) => {
      event.e.preventDefault();
      event.e.stopPropagation();
      setZoomByWheel(event.e);
      setViewport();
    },

    'mouse:down': (e: fabric.IEvent<MouseEvent>) => {
      const { target, button } = e;

      if (button === 1) {
        // left click
        if (onDrawObj.current) drawingBreak(e);
        else if (drawType) drawingStart(e);
        else if (isMidpoint(target)) addPointToPolygon(target as fabric.Circle);
        else if (!target) {
          const evt = e.e as any;
          const { clientX, clientY } = isTouchEvent(evt) ? evt.touches[0] : evt;
          lastPosition.current = new Point(clientX, clientY);
          selectedObjects.length && selectObjects();
          canvas.setCursor('grabbing');
          isPanning.current = true;
        }
      } else if (button === 3) {
        // right click
        if (target) lastSelection.current = target;
      }
    },

    'mouse:move': (e: fabric.IEvent<MouseEvent>) => {
      if (onDrawObj.current) drawOnMouseMove(e);
      else if (isPanning.current) {
        const { e: evt } = e as any;
        const { clientX, clientY } = isTouchEvent(evt) ? evt.touches[0] : evt;
        const { x: lastX, y: lastY } = lastPosition.current;
        const offset = new Point(clientX - lastX, clientY - lastY);
        setViewport(offset);
        canvas.setViewportTransform(canvas.viewportTransform as number[]);
        lastPosition.current = new Point(clientX, clientY);
        canvas.setCursor('grabbing');
      }
    },

    'mouse:up': (e: fabric.IEvent<MouseEvent>) => {
      const { target, button } = e;

      if (button === 1) {
        // left click
        if (onDrawObj.current && drawType === LabelType.Point) drawingStop();
        else if (isMidpoint(target)) syncCanvasToState();
        else if (isPanning.current) isPanning.current = false;
      } else if (button === 3) {
        // right click
        if (
          lastSelection.current === target &&
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
