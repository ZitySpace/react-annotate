import { fabric } from 'fabric';
import { useStore } from 'zustand';
import { useEffect, useRef } from 'react';
import {
  CanvasMetaStore,
  CanvasMetaStoreProps,
} from '../stores/CanvasMetaStore';
import { CanvasStore, CanvasStoreProps } from '../stores/CanvasStore';
import { ImageMetaStore, ImageMetaStoreProps } from '../stores/ImageMetaStore';
import { SelectionStore, SelectionStoreProps } from '../stores/SelectionStore';
import { ColorStore, ColorStoreProps } from '../stores/ColorStore';
import {
  LabeledObject,
  LabelType,
  newLabelFromCanvasObject,
  BoxLabel,
  PointLabel,
  LineLabel,
} from '../labels';
import { getBetween } from '../utils';
import { NEW_CATEGORY_NAME, STROKE_WIDTH } from '../interfaces/config';
import { CoordSystemType } from '../labels/BaseLabel';

function parseEvent<T extends MouseEvent | WheelEvent>(e: fabric.IEvent<T>) {
  const { button, target, pointer, e: evt } = e;
  evt.preventDefault();
  evt.stopPropagation();

  return { button, target, pointer, evt };
}

export const useListeners = (syncCanvasToState: () => void) => {
  const { canvas, initSize: canvasInitSize } = useStore(
    CanvasMetaStore,
    (s: CanvasMetaStoreProps) => s
  );

  const curState = useStore(CanvasStore, (s: CanvasStoreProps) => s.curState());

  const {
    size: imageSize,
    scale,
    offset,
  } = useStore(ImageMetaStore, (s: ImageMetaStoreProps) => s);

  const {
    drawType,
    setDrawType,
    labels: selectedLabels,
    selectLabels,
    category: selectedCategory,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  const getColor = useStore(ColorStore, (s: ColorStoreProps) => s.getColor);

  // lastPosition is relative mouse coords on the viewport,
  // e.g. top-left is always (0,0)
  const lastPosition = useRef<fabric.Point>(new fabric.Point(0, 0));
  // origPosition is absolute coords on the canvas,
  // e.g. top-left of image is always (offset.x, offset.y)
  const origPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanning = useRef<boolean>(false);
  const isDrawing = useRef<boolean>(false);
  const isEditing = useRef<boolean>(false);
  const isObjectMoving = useRef<boolean>(false);
  const listenerGroup = useRef<string>('default');

  useEffect(() => {
    if (!canvas) return;
    refreshListeners();
  }, [selectedLabels]);

  useEffect(() => {
    if (!canvas) return;

    const group = drawType === LabelType.None ? 'default' : drawType + ':draw';
    setListeners(group);
  }, [drawType]);

  if (!canvas) return () => {};

  const setZoomByWheel = (evt: WheelEvent) => {
    const { deltaY, offsetX: x, offsetY: y } = evt;

    // make touchBoard more smooth, using ctrlKey to identify touchBoard
    // more detail in: https://use-gesture.netlify.app/docs/options/#modifierkey
    const delta = deltaY * (evt.ctrlKey ? 3 : 1);
    const zoom = getBetween(canvas.getZoom() * 0.999 ** delta, 0.01, 20);
    canvas.zoomToPoint({ x, y }, zoom);
  };

  const setViewport = (x: number = 0, y: number = 0) => {
    const zoom = canvas.getZoom();
    const [w, h] = [canvas.width!, canvas.height!];
    const vpt = canvas.viewportTransform as number[];
    const offsetX = w - canvasInitSize!.w * zoom;
    const offsetY = h - canvasInitSize!.h * zoom;
    vpt[4] = offsetX > 0 ? offsetX / 2 : getBetween(vpt[4] + x, offsetX, 0);
    vpt[5] = offsetY > 0 ? offsetY / 2 : getBetween(vpt[5] + y, offsetY, 0);
    canvas.requestRenderAll();
  };

  const selectCanvasObject = (obj: LabeledObject) => {
    const label = newLabelFromCanvasObject({
      obj,
      scale,
      offset,
    })!;
    selectLabels([label]);
  };

  const sharedListeners = {
    'selection:created': (e: fabric.IEvent<Event>) => {
      if (e.e && selectedLabels.length !== 1) {
        selectCanvasObject((e as any).selected[0]);
      }
    },

    'selection:cleared': (e: fabric.IEvent<Event>) => {
      e.e && selectLabels([]);
    },

    'mouse:wheel': (e: fabric.IEvent<Event>) => {
      const { evt } = parseEvent(e as fabric.IEvent<WheelEvent>);

      setZoomByWheel(evt);
      setViewport();
    },
  };

  const defaultListeners = {
    'mouse:down': (e: fabric.IEvent<Event>) => {
      const { pointer } = parseEvent(e as fabric.IEvent<MouseEvent>);

      isPanning.current = true;
      lastPosition.current = pointer!;
      canvas.setCursor('grabbing');
      selectLabels([]);
    },

    'mouse:move': (e: fabric.IEvent<Event>) => {
      const { pointer, switched } = trySwitchGroup(e, 'default');
      if (switched) return;

      if (!isPanning.current) return;

      setViewport(
        pointer!.x - lastPosition.current.x,
        pointer!.y - lastPosition.current.y
      );
      canvas.setViewportTransform(canvas.viewportTransform as number[]);
      lastPosition.current = pointer!;
      canvas.setCursor('grabbing');
    },

    'mouse:up': (e: fabric.IEvent<Event>) => {
      isPanning.current = false;
      canvas.setCursor('default');
    },
  };

  const inImageOI = (x: number, y: number) =>
    x >= offset.x &&
    y >= offset.y &&
    x + offset.x < canvasInitSize!.w &&
    y + offset.y < canvasInitSize!.h;

  const drawBoxListeners = {
    'mouse:down': (e: fabric.IEvent<Event>) => {
      const { evt } = parseEvent(e as fabric.IEvent<MouseEvent>);
      const { x, y } = canvas.getPointer(evt);

      if (!inImageOI(x, y)) return;

      origPosition.current = { x, y };

      const category = selectedCategory || NEW_CATEGORY_NAME;
      const id = Math.max(-1, ...curState.map(({ id }) => id)) + 1;
      const color = getColor(category);

      const rect = new BoxLabel({
        x,
        y,
        w: 0,
        h: 0,
        category,
        id,
        scale,
        offset,
        coordSystem: CoordSystemType.Canvas,
      }).toCanvasObjects(color, false)[0];

      canvas.add(rect);
      isDrawing.current = true;
    },

    'mouse:move': (e: fabric.IEvent<Event>) => {
      if (!isDrawing.current) return;

      const { evt } = parseEvent(e as fabric.IEvent<MouseEvent>);
      const { x, y } = canvas.getPointer(evt);
      const { x: origX, y: origY } = origPosition.current;
      const { w: canvasW, h: canvasH } = canvasInitSize!;

      const x_ = Math.max(offset.x, x < origX ? x : origX);
      const x2_ = Math.min(canvasW - offset.x, x > origX ? x : origX);
      const y_ = Math.max(offset.y, y < origY ? y : origY);
      const y2_ = Math.min(canvasH - offset.y, y > origY ? y : origY);

      const rect = canvas.getObjects().at(-1)!;
      rect.set({
        left: x_ - STROKE_WIDTH / 2,
        top: y_ - STROKE_WIDTH / 2,
        width: x2_ - x_,
        height: y2_ - y_,
      });

      canvas.requestRenderAll();
    },

    'mouse:up': (e: fabric.IEvent<Event>) => {
      if (!isDrawing.current) return;

      const rect = canvas.getObjects().at(-1)! as fabric.Rect;
      const invalid =
        rect.width! <= STROKE_WIDTH || rect.height! <= STROKE_WIDTH;

      if (invalid) {
        canvas.remove(rect);
      } else {
        syncCanvasToState();
        setDrawType();
        selectCanvasObject(rect as LabeledObject);
      }

      isDrawing.current = false;
    },
  };

  const editBoxListeners = {
    'mouse:down': (e: fabric.IEvent<Event>) => {
      isEditing.current = true;
    },

    'mouse:up': (e: fabric.IEvent<Event>) => {
      isEditing.current = false;
      isObjectMoving.current = false;
    },

    'mouse:move': (e: fabric.IEvent<Event>) => {
      const { switched } = trySwitchGroup(e, 'box:edit');
      if (switched) return;

      const rect = canvas.getActiveObject() as fabric.Rect;
      if (!rect || !isEditing.current) return;

      const { w: canvasW, h: canvasH } = canvasInitSize!;

      const { left, top } = rect;
      const x = left! + STROKE_WIDTH / 2;
      const y = top! + STROKE_WIDTH / 2;
      const w = rect.getScaledWidth() - STROKE_WIDTH;
      const h = rect.getScaledHeight() - STROKE_WIDTH;
      const x2 = x + w;
      const y2 = y + h;

      if (isObjectMoving.current) {
        const x_ = Math.min(Math.max(offset.x, x), canvasW - offset.x - w!);
        const y_ = Math.min(Math.max(offset.y, y), canvasH - offset.y - h!);
        if (x === x_ && y === y_) return;

        rect.set({
          left: x_ - STROKE_WIDTH / 2,
          top: y_ - STROKE_WIDTH / 2,
        });
      } else {
        const x_ = Math.min(Math.max(offset.x, x), canvasW - offset.x);
        const y_ = Math.min(Math.max(offset.y, y), canvasH - offset.y);
        const x2_ = Math.min(Math.max(offset.x, x2), canvasW - offset.x);
        const y2_ = Math.min(Math.max(offset.y, y2), canvasH - offset.y);

        if (x === x_ && y === y_ && x2 === x2_ && y2 === y2_) return;

        // has to update scaleX/Y as well to set width/height correctly !!!
        rect.set({
          left: x_ - STROKE_WIDTH / 2,
          top: y_ - STROKE_WIDTH / 2,
          width: x2_ - x_,
          height: y2_ - y_,
          scaleX: 1,
          scaleY: 1,
        });
      }

      canvas.requestRenderAll();
    },

    'object:moving': (e: fabric.IEvent<Event>) => {
      isObjectMoving.current = true;
    },

    'object:modified': (e: fabric.IEvent<Event>) => {
      syncCanvasToState();
    },
  };

  const setListeners = (group: string) => {
    let listeners: { [key: string]: (e: fabric.IEvent<Event>) => void } = {};

    if (group === 'default')
      listeners = { ...sharedListeners, ...defaultListeners };

    if (group === 'box:edit')
      listeners = { ...sharedListeners, ...editBoxListeners };

    if (group === 'box:draw')
      listeners = { ...sharedListeners, ...drawBoxListeners };

    canvas.off();
    Object.entries(listeners).forEach(([event, handler]) =>
      canvas.on(event, handler)
    );

    listenerGroup.current = group;
  };

  const trySwitchGroup = (e: fabric.IEvent<Event>, currGroup: string) => {
    const { pointer, target } = parseEvent(e as fabric.IEvent<MouseEvent>);
    const newGroup =
      target && target.type !== 'textbox'
        ? (target as LabeledObject).labelType + ':edit'
        : 'default';

    if (currGroup === newGroup) return { pointer, switched: false };

    setListeners(newGroup);

    if (e.e.type === 'mousemove')
      canvas.fire('mouse:over', { target, pointer });

    return { pointer, switched: true, target };
  };

  const refreshListeners = () => setListeners(listenerGroup.current);
  const resetListeners = () => setListeners('default');

  return resetListeners;
};
