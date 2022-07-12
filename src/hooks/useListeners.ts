import { fabric } from 'fabric';
import { useStore } from 'zustand';
import { useRef } from 'react';
import {
  CanvasMetaStore,
  CanvasMetaStoreProps,
} from '../stores/CanvasMetaStore';
import { ImageMetaStore, ImageMetaStoreProps } from '../stores/ImageMetaStore';
import { SelectionStore, SelectionStoreProps } from '../stores/SelectionStore';
import { LabeledObject, LabelType, newLabelFromCanvasObject } from '../labels';
import { getBetween } from '../utils';

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

  const {
    size: imageSize,
    scale,
    offset,
  } = useStore(ImageMetaStore, (s: ImageMetaStoreProps) => s);

  const {
    drawType,
    labels: selectedLabels,
    selectLabels,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  const lastPosition = useRef<fabric.Point>(new fabric.Point(0, 0));
  const isPanning = useRef<boolean>(false);

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

  const sharedListeners = {
    'selection:created': (e: fabric.IEvent<Event>) => {
      if (e.e && !selectedLabels.length) {
        const anno = newLabelFromCanvasObject({
          obj: (e as any).selected[0],
          scale,
          offset,
        })!;
        selectLabels([anno]);
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
      const { button, pointer } = parseEvent(e as fabric.IEvent<MouseEvent>);

      isPanning.current = true;
      lastPosition.current = pointer!;
      canvas.setCursor('grabbing');
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
      const { button } = parseEvent(e as fabric.IEvent<MouseEvent>);

      isPanning.current = false;
      canvas.setCursor('default');
    },
  };

  const drawBoxListeners = {
    'mouse:down': (e: fabric.IEvent<Event>) => {},
    'mouse:move': (e: fabric.IEvent<Event>) => {},
    'mouse:up': (e: fabric.IEvent<Event>) => {},
  };

  const editBoxListeners = {
    'mouse:down': (e: fabric.IEvent<Event>) => {
      console.log('edit rect mousedown');
    },
    'mouse:move': (e: fabric.IEvent<Event>) => {
      const { pointer, switched } = trySwitchGroup(e, 'box:edit');
      if (switched) return;
    },
    'mouse:up': (e: fabric.IEvent<Event>) => {},
    'mouse:over': (e: fabric.IEvent<Event>) => {
      console.log('edit rect hover');
    },
  };

  const setListeners = (group: string) => {
    let listeners: { [key: string]: (e: fabric.IEvent<Event>) => void } = {};

    if (group === 'default')
      listeners = { ...sharedListeners, ...defaultListeners };

    if (group === 'box:edit')
      listeners = { ...sharedListeners, ...editBoxListeners };

    canvas.off();
    Object.entries(listeners).forEach(([event, handler]) =>
      canvas.on(event, handler)
    );
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

    return { pointer, switched: true };
  };

  return setListeners;
};
