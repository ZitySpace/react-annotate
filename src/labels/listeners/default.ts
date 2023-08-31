import * as fabric from '@zityspace/fabric';
import { TPointerEventInfo as IEvent } from '@zityspace/fabric/src/EventTypeDefs';

import { setup } from './setup';
import { parseEvent, getBoundedValue } from '../utils';

export const useDefaultListeners = () => {
  const {
    canvas,
    canvasInitSize,
    lastPosition,
    isPanning,
    selectedLabels,
    selectLabels,
    selectCanvasObject,
    trySwitchGroupRef,
  } = setup();

  if (!canvas) return {};

  const setZoomByWheel = (evt: WheelEvent) => {
    const { deltaY, offsetX: x, offsetY: y } = evt;

    // make touchBoard more smooth, using ctrlKey to identify touchBoard
    // more detail in: https://use-gesture.netlify.app/docs/options/#modifierkey
    const delta = deltaY * (evt.ctrlKey ? 3 : 1);
    const zoom = getBoundedValue(canvas.getZoom() * 0.999 ** delta, 0.01, 20);
    canvas.zoomToPoint(new fabric.Point({ x, y }), zoom);
  };

  const setViewport = (x: number = 0, y: number = 0) => {
    const zoom = canvas.getZoom();
    const [w, h] = [canvas.width!, canvas.height!];
    const vpt = canvas.viewportTransform as number[];
    const offsetX = w - canvasInitSize!.w * zoom;
    const offsetY = h - canvasInitSize!.h * zoom;
    vpt[4] =
      offsetX > 0 ? offsetX / 2 : getBoundedValue(vpt[4] + x, offsetX, 0);
    vpt[5] =
      offsetY > 0 ? offsetY / 2 : getBoundedValue(vpt[5] + y, offsetY, 0);
    canvas.requestRenderAll();
    canvas.getObjects().forEach((obj) => obj.setCoords());
  };

  const sharedListeners = {
    'selection:created': (e: IEvent<MouseEvent>) => {
      if (e.e && selectedLabels.length !== 1) {
        selectCanvasObject((e as any).selected[0]);
      }
    },

    'mouse:wheel': (e: IEvent<WheelEvent>) => {
      const { evt } = parseEvent(e);

      setZoomByWheel(evt as WheelEvent);
      setViewport();
    },
  };

  const defaultListeners = {
    'mouse:down': (e: IEvent<MouseEvent>) => {
      const { absolutePointer } = parseEvent(e);

      isPanning.current = true;
      lastPosition.current = absolutePointer;
      canvas.setCursor('grabbing');
      selectLabels([]);
    },

    'mouse:move': (e: IEvent<MouseEvent>) => {
      const { absolutePointer, switched } = trySwitchGroupRef.current(
        e,
        'default'
      );
      if (switched) return;

      if (!isPanning.current) return;

      setViewport(
        absolutePointer.x - lastPosition.current.x,
        absolutePointer.y - lastPosition.current.y
      );
      canvas.setViewportTransform(canvas.viewportTransform);
      lastPosition.current = absolutePointer;
      canvas.setCursor('grabbing');
    },

    'mouse:up': (e: IEvent<MouseEvent>) => {
      isPanning.current = false;
      canvas.setCursor('default');
    },
  };

  return {
    sharedListeners,
    defaultListeners,
  };
};
