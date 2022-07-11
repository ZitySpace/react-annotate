import md5 from 'md5';
import { useEffect } from 'react';
import { useStore } from 'zustand';
import { Label, LabeledObject } from '../labels';
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
import { LabeledObject, newLabelFromCanvasObject } from '../labels';
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
    visibleType,
    labels: selectedLabels,
    isSelected,
    isVisible,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  const syncCanvasToState = () => {
    if (!canvas) return;
    console.log('syncCanvasToState called'); // TODO: remove

    const activeObject = canvas.getActiveObject();
    const newState: Label[] = canvas
      .getObjects()
      .filter((obj) => obj.type !== 'textbox')
      .map((obj) => {
        if (obj === activeObject) {
          const now = getLocalTimeISOString();
          obj.setOptions({ timestamp: now, hash: md5(now) });
        }
        return newLabelFromCanvasObject({
          obj: obj as LabeledObject,
          offset,
          scale,
        })!;
      });

    pushState(newState);
  };

  const syncStateToCanvas = (state: CanvasState) => {
    if (!canvas) return;
    console.log('syncStateToCanvas called'); // TODO: remove

    canvas.remove(...canvas.getObjects());
    state.forEach((anno: Label) => {
      const color = getColor(anno.category);
      const canvasObjects = anno.toCanvasObjects(color);
      canvasObjects.forEach((obj) => {
        const visible = isVisible(obj);
        obj.visible = visible;
        if (!visible) obj.hasControls = false;
      });
      canvas.add(...canvasObjects);
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
    selectedLabels,
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
