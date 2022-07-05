import md5 from 'md5';
import { useEffect, useMemo, useRef } from 'react';
import { useStore } from 'zustand';
import { Label } from '../classes/Label';
import {
  CanvasMetaStore,
  CanvasMetaStoreProps,
} from '../stores/CanvasMetaStore';
import {
  CanvasState,
  CanvasStore,
  CanvasStoreProps,
} from '../stores/CanvasStore';
import { ColorStore, ColorStoreProps } from '../stores/ColorStore';
import { CVStore, CVStoreProps } from '../stores/CVStore';
import { ImageMetaStore, ImageMetaStoreProps } from '../stores/ImageMetaStore';
import { SelectionStore, SelectionStoreProps } from '../stores/SelectionStore';
import { getLocalTimeISOString } from '../utils';
import { isLabel, newLabel } from '../utils/label';
import { useCanvas } from './useCanvas';
import { useMouse } from './useMouse';

export const useSynchronizer = () => {
  const { canvas } = useStore(CanvasMetaStore, (s: CanvasMetaStoreProps) => s);
  const { setReady: setCVReady } = useStore(CVStore, (s: CVStoreProps) => s);

  const {
    image: imageObj,
    scale,
    offset,
    dataReady,
  } = useStore(ImageMetaStore, (s: ImageMetaStoreProps) => s);

  const [curState, pushState] = useStore(CanvasStore, (s: CanvasStoreProps) => [
    s.curState(),
    s.pushState,
  ]);

  const getColor = useStore(ColorStore, (s: ColorStoreProps) => s.getColor);

  const {
    drawType,
    AIMode,
    visibleType,
    objects: selectedObjects,
    isSelected,
    selectObjects,
    isVisible,
    category,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  const syncCanvasToState = () => {
    console.log('syncCanvasToState called'); // TODO: remove

    const allCanvasObjects = canvas!.getObjects().filter(isLabel);
    const activeObject = canvas!.getActiveObject();
    const newState: Label[] = allCanvasObjects.map((obj) => {
      if (obj === activeObject) {
        const now = getLocalTimeISOString();
        obj.setOptions({ timestamp: now, hash: md5(now) });
      }
      return newLabel({ obj, offset, scale });
    });
    pushState(newState);
  };

  const syncStateToCanvas = (state: CanvasState) => {
    if (!canvas) return;
    console.log('syncStateToCanvas called'); // TODO: remove

    canvas.remove(...canvas.getObjects());
    state.forEach((anno: Label) => {
      const currentColor = getColor(anno.category);
      const fabricObjects = anno.getFabricObjects(currentColor);
      fabricObjects.forEach((obj) => {
        obj.visible = isVisible(obj);
      });
      canvas.add(...fabricObjects);
    });
    const activeObjects = canvas
      .getObjects('rect')
      .filter((obj) => isSelected((obj as any).id));
    if (activeObjects.length === 1) canvas.setActiveObject(activeObjects[0]);
  };

  const canvasListeners = useCanvas(syncCanvasToState);
  const mouseListeners = useMouse(syncCanvasToState);

  /**
   * mount listeners to canvas when canvas was exist
   */
  useEffect(() => {
    if (!canvas) return;
    canvas.off();
    Object.entries({ ...canvasListeners, ...mouseListeners }).forEach(
      ([event, handler]) => canvas.on(event, handler)
    );
  }, [canvas, canvasListeners, mouseListeners]);

  /**
   * when image and annotations was ready for render, render them then reset the viewport
   * otherwise clear them
   */
  useEffect(() => {
    if (!canvas) return;

    if (dataReady && imageObj)
      canvas
        .setBackgroundImage(imageObj, () => {})
        .setViewportTransform([1, 0, 0, 1, 0, 0]);
    else canvas.clear();
  }, [imageObj, dataReady]);

  /**
   * Sync the currrent state to the canvas and the selection
   */
  useEffect(() => {
    if (!dataReady) return;
    syncStateToCanvas(curState); // sync state
  }, [
    dataReady,
    JSON.stringify(curState),
    selectedObjects,
    drawType,
    visibleType,
  ]);

  /**
   * load opencvjs library
   */
  useEffect(() => {
    if (!window['cv']) {
      const script = document.createElement('script');
      script.onload = setCVReady;
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://docs.opencv.org/4.x/opencv.js';
      document.body.appendChild(script);
    }
  }, [window['cv']]);
};
