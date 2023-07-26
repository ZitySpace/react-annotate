import md5 from 'md5';
import * as fabric from '@zityspace/fabric';
import { useEffect } from 'react';
import { useStore } from 'zustand';
import { Label, LabeledObject, LabelType } from '../labels';
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
import { useLabelStores } from '../labels/stores';
import { useLabelComponents } from '../labels/components';

export const useLabels = () => {
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

  const syncCanvasToState = (id?: number) => {
    if (!canvas) return;
    console.log('syncCanvasToState called');

    // group objects by id
    const groupedObjects: { [key: number]: LabeledObject[] } = canvas
      .getObjects()
      .filter((obj) => (obj as LabeledObject).syncToLabel)
      .reduce((grp, obj) => {
        const { id } = obj as LabeledObject;
        (grp[id] = grp[id] || []).push(obj);
        return grp;
      }, {});

    // generate label for each id
    const newState: Label[] = Object.entries(groupedObjects).map(
      ([id_, objs], _) => {
        const now = getLocalTimeISOString();

        return newLabelFromCanvasObject({
          scale,
          offset,
          ...([
            LabelType.Polyline,
            LabelType.Mask,
            LabelType.Keypoints,
          ].includes(objs[0].labelType)
            ? {
                grp: objs,
              }
            : { obj: objs[0] }),
          ...(id === parseInt(id_) && {
            timestamp: now,
            hash: objs[0].hash || md5(now),
          }),
        })!;
      }
    );

    pushState(newState);
  };

  const labelStores = useLabelStores();

  const syncStateToCanvas = (state: CanvasState, id?: number) => {
    if (!canvas) return;
    console.log('syncStateToCanvas called');

    const objs = canvas.getObjects() as fabric.Object[];
    let objsToRemove: fabric.Object[] = [];
    if (id === undefined) objsToRemove = objs;
    else {
      const objsToRemove_ = objs.filter((o) => (o as LabeledObject).id === id);
      objsToRemove = objsToRemove_.length ? objsToRemove_ : objs;
    }

    canvas.remove(...objsToRemove);
    state.forEach((anno: Label) => {
      if (id !== undefined && anno.id !== id) return;

      const color = getColor(anno.category);
      const mode = calcLabelMode(anno);

      const store = labelStores[anno.labelType];
      const dynamicArgs = store ? store['dynamicArgs'] ?? [] : [];

      const canvasObjects = anno
        .toCanvasObjects(color, mode, ...dynamicArgs)
        .flat(2);
      canvas.add(...canvasObjects);
    });

    // we are using fabric's default listeners to edit rectangle
    // need to first make it active
    const activeObjects = (canvas.getObjects() as fabric.Object[]).filter(
      (obj) => isSelected((obj as any).id)
    );

    if (
      activeObjects.length === 1 &&
      (activeObjects[0] as LabeledObject).labelType === 'box'
    )
      canvas.setActiveObject(activeObjects[0]);
  };

  const { resetListeners } = useListeners(syncCanvasToState, (id?: number) => {
    if (!dataReady) return;
    syncStateToCanvas(curState, id);
  });

  const LabelComponents = useLabelComponents();

  useEffect(() => {
    if (!canvas) return;

    if (dataReady && imageObj) {
      canvas.backgroundImage = imageObj;
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

      resetListeners();
    } else canvas.clear();
  }, [imageObj, dataReady]);

  useEffect(() => {
    if (!dataReady) return;
    syncStateToCanvas(curState);
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
      script.src = '/opencv.js'; // try to load from local server first
      script.onerror = () => {
        // if error occurs while loading from local server, try the external URL
        script.src = 'https://docs.opencv.org/4.x/opencv.js';
        document.body.appendChild(script);
      };
      document.body.appendChild(script);
    }
  }, [window['cv']]);

  return LabelComponents;
};
