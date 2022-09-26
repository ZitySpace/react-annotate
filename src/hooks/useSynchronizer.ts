import md5 from 'md5';
import { useEffect, useRef } from 'react';
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
import {
  getLocalTimeISOString,
  newLabelFromCanvasObject,
} from '../labels/utils';
import { useListeners } from '../labels/listeners';

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
    calcLabelMode,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  const syncCanvasToState = () => {
    if (!canvas) return;
    console.log('syncCanvasToState called'); // TODO: remove

    // TODO, should not use activeObject as the detection of which label/object is edited
    // should use id
    const activeObject = canvas.getActiveObject();
    const newState: Label[] = canvas
      .getObjects()
      .filter((obj) => (obj as LabeledObject).syncToLabel)
      .map((obj) => {
        if (obj === activeObject) {
          const now = getLocalTimeISOString();
          obj.setOptions({ timestamp: now, hash: md5(now) });
        }
        return newLabelFromCanvasObject({
          obj: obj as LabeledObject,
          scale,
          offset,
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
      const mode = calcLabelMode(anno);
      const canvasObjects = anno.toCanvasObjects(color, mode);
      canvas.add(...canvasObjects);
    });

    const activeObjects = canvas
      .getObjects()
      .filter((obj) => isSelected((obj as any).id));

    if (
      activeObjects.length === 1 &&
      (activeObjects[0] as LabeledObject).labelType === 'box'
    )
      canvas.setActiveObject(activeObjects[0]);
  };

  const { resetListeners } = useListeners(syncCanvasToState);

  useEffect(() => {
    if (!canvas) return;

    if (dataReady && imageObj) {
      canvas
        .setBackgroundImage(imageObj, () => {})
        .setViewportTransform([1, 0, 0, 1, 0, 0]);

      resetListeners();
    } else canvas.clear();
  }, [imageObj, dataReady]);

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
