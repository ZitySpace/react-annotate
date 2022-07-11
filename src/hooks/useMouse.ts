import {
  CanvasMetaStore,
  CanvasMetaStoreProps,
} from '../stores/CanvasMetaStore';
import {
  InteractionStore,
  InteractionStoreProps,
} from '../stores/InteractionStore';
import { SelectionStore, SelectionStoreProps } from '../stores/SelectionStore';
import { getBetween } from '../utils';
import { useStore } from 'zustand';
import { useRef } from 'react';
import { fabric } from 'fabric';

function parseEvent<T extends MouseEvent | WheelEvent>(e: fabric.IEvent<T>) {
  const { button, target, pointer, e: evt } = e;
  evt.preventDefault();
  evt.stopPropagation();

  return { button, target, pointer, evt };
}

export const useMouse = (syncCanvasToState: () => void) => {
  const { canvas, initSize: canvasInitSize } = useStore(
    CanvasMetaStore,
    (s: CanvasMetaStoreProps) => s
  );

  const { mode, setMode } = useStore(
    InteractionStore,
    (s: InteractionStoreProps) => s
  );

  const {
    drawType,
    labels: selectedLabels,
    selectLabels,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  const lastPosition = useRef<fabric.Point>(new fabric.Point(0, 0));

  if (!canvas) return {};

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

  const panning = {
    start: (pos: fabric.Point) => {
      selectedLabels.length && selectLabels([]);
      setMode('panning');
      canvas.setCursor('grabbing');
      lastPosition.current = pos;
    },

    move: (pos: fabric.Point) => {
      setViewport(
        pos.x - lastPosition.current.x,
        pos.y - lastPosition.current.y
      );
      canvas.setViewportTransform(canvas.viewportTransform as number[]);
      canvas.setCursor('grabbing');
      lastPosition.current = pos;
    },

    stop: () => {
      setMode('none');
    },
  };

  const listeners = {
    'mouse:wheel': (e: fabric.IEvent<WheelEvent>) => {
      const { evt } = parseEvent(e);

      setZoomByWheel(evt);
      setViewport();
    },

    'mouse:down': (e: fabric.IEvent<MouseEvent>) => {
      const { target, button, pointer } = parseEvent(e);

      if (button === 1) {
        if (mode === 'none') {
          if (!target) {
            if (drawType) {
            } else panning.start(pointer!);
          } else {
          }
        }

        if (mode === 'drawing') {
        }

        if (mode === 'modifying') {
        }
      }
    },

    'mouse:up': (e: fabric.IEvent<MouseEvent>) => {
      const { button } = parseEvent(e);

      if (button === 1) {
        if (mode === 'panning') panning.stop();
      }
    },

    'mouse:move': (e: fabric.IEvent<MouseEvent>) => {
      const { pointer } = parseEvent(e);

      if (mode === 'panning') panning.move(pointer!);
    },
  };

  return listeners;
};
