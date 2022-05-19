import { usePinch } from '@use-gesture/react';
import { fabric } from 'fabric';
import { useRef } from 'react';
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
import { getBetween, isInvalid, isTouchEvent } from '../utils';
import {
  isEndpoint,
  isLine,
  isPoint,
  isPolygon,
  isPolygonLine,
  isRect,
  newLabel,
  updateEndpointAssociatedLinesPosition,
} from '../utils/label';
import { UseColorsReturnProps } from './useColor';
import { useStore } from 'zustand';
import { CanvasStore, CanvasStoreProps } from '../stores/CanvasStore';
import {
  CanvasMetaStore,
  CanvasMetaStoreProps,
} from '../stores/CanvasMetaStore';
import { ImageMetaStore, ImageMetaStoreProps } from '../stores/ImageMetaStore';
import { SelectionStore, SelectionStoreProps } from '../stores/SelectionStore';

export const useMouse = ({
  annoColors,
  loadListeners,
  syncCanvasToState,
}: {
  annoColors: UseColorsReturnProps;
  loadListeners: (newListeners: object) => void;
  syncCanvasToState: () => void;
}) => {
  const lastPosition = useRef<Point>(new Point());
  const isPanning = useRef<boolean>(false);
  const isDrawingStarted = useRef<boolean>(false);
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
    isVisible,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  // mount gestures event listener
  usePinch(() => {}, { target: canvas?.getElement().parentElement });

  if (!canvas) return;

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

  const drawingStart = (event: fabric.IEvent) => {
    const { x, y } = imageBoundary.within(canvas.getPointer(event.e));
    lastPosition.current = new Point(x, y);

    const category = selectedCategory || NEW_CATEGORY_NAME;
    const id = Math.max(-1, ...curState.map(({ id }) => id)) + 1;
    const color = annoColors.get(category);

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
    isDrawingStarted.current = true;
  };

  const drawOnMouseMove = (event: fabric.IEvent) => {
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
      const color = annoColors.get(category);
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
    } else drawingStop();
  };

  const drawingStop = () => {
    console.log('drawingStop');
    const obj = onDrawObj.current as any;

    if (isInvalid(obj)) {
      canvas.remove(...canvas.getObjects().filter((o: any) => o.id === obj.id));
    } else {
      selectObjects([newLabel({ obj, offset, scale })]);
      canvas.setActiveObject(
        [LabelType.Line].includes(obj.labelType)
          ? obj.endpoints[obj.endpoints.length - 1]
          : obj
      );
    }
    isDrawingStarted.current = false;
    onDrawObj.current = null;
    setDrawType();
    canvas.renderAll();
    syncCanvasToState();
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
      } else if (obj.type === 'midpoint') canvas.remove(obj);

      canvas.requestRenderAll();
    },

    'mouse:wheel': (event: fabric.IEvent<WheelEvent>) => {
      event.e.preventDefault();
      event.e.stopPropagation();
      setZoomByWheel(event.e);
      setViewport();
    },

    'mouse:down': (e: fabric.IEvent<MouseEvent>) => {
      if (isDrawingStarted.current) drawingBreak(e);
      else if (drawType) drawingStart(e);
      else if (!canvas.getActiveObject()) {
        const evt = e.e as any;
        const { clientX, clientY } = isTouchEvent(evt) ? evt.touches[0] : evt;
        lastPosition.current = new Point(clientX, clientY);
        selectObjects();
        canvas.setCursor('grabbing');
        isPanning.current = true;
      }
    },

    'mouse:move': (e: fabric.IEvent<MouseEvent>) => {
      if (isDrawingStarted.current) drawOnMouseMove(e);
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

    'mouse:up': () => {
      if (isDrawingStarted.current && drawType === LabelType.Point)
        drawingStop();
      else if (isPanning.current) isPanning.current = false;
    },
  };

  loadListeners(listeners);
};
