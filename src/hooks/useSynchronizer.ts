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
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  // render lock used to avoid whole cycle callback caused by canvas changed which will ruin the canvas
  const renderLock = useRef<boolean>(false);

  const setRenderLock = () => {
    renderLock.current = true;
  };

  const getRenderLock = () => {
    const nowLock = renderLock.current;
    renderLock.current = false; // if it was queried, unlock
    return nowLock;
  };

  /**
   * Update all labels' fabric objects via regenerate them
   */
  const updateFabricObjects = () => {
    if (!canvas) return;
    const currentLabelObjs = canvas.getObjects().filter(isLabel);
    const newObjects = currentLabelObjs.map((obj: any) =>
      newLabel({ obj, offset, scale }).getFabricObjects(getColor(obj.category))
    );
    canvas.remove(...canvas.getObjects()).add(...newObjects.flat());
  };

  const { syncStateToCanvas, syncCanvasToState } = useMemo(
    () => ({
      syncCanvasToState: () => {
        console.log('syncCanvasToState called'); // TODO: remove

        const allCanvasObjects = canvas!.getObjects().filter(isLabel);
        const newState: Label[] = allCanvasObjects.map((obj) =>
          newLabel({ obj, offset, scale })
        );
        pushState(newState);
        setRenderLock(); // avoid useEffect hook invoke syncStateToCanvas method
      },

      syncStateToCanvas: (state: CanvasState) => {
        if (!canvas || getRenderLock()) return;
        console.log('syncStateToCanvas called'); // TODO: remove

        canvas.remove(...canvas.getObjects());
        state.forEach((anno: Label) => {
          const currentColor = getColor(anno.category);
          const fabricObjects = anno.getFabricObjects(currentColor);
          fabricObjects.forEach((obj) => {
            const { labelType, type, id } = obj as any;
            obj.visible = isVisible(labelType, type, id, false);
          });
          canvas.add(...fabricObjects);
        });
      },
    }),
    [canvas, scale, offset]
  );

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
    selectObjects(
      curState.filter(({ id }) => isSelected(id)),
      true
    ); // sync to the selection
  }, [JSON.stringify(curState), dataReady]); // Deep compare

  /**
   * Sync selection to the canvas
   * recalculate the objects' properties and the active of the canvas
   */
  useEffect(() => {
    if (!canvas) return;

    const adjustMode = selectedObjects.length === 1;
    const isShowText = !(drawType || adjustMode);
    if (isShowText) updateFabricObjects();

    canvas.forEachObject((obj: any) => {
      obj.visible = isVisible(obj.labelType, obj.type, obj.id, isShowText);
      obj.selectable = !(AIMode && adjustMode);
    });

    const selectedRect = canvas
      .getObjects('rect')
      .filter((obj) => isSelected((obj as any).id));

    if (adjustMode && selectedRect.length && visibleType.length)
      canvas.setActiveObject(selectedRect[0]);
    else canvas.discardActiveObject();

    canvas.requestRenderAll();
  }, [drawType, AIMode, visibleType, selectedObjects]);

  /**
   * load opencvjs library
   */
  useEffect(() => {
    if (!window['cv']) {
      const script = document.createElement('script');
      script.onload = setCVReady;
      script.type = 'text/javascript';
      script.async = true;
      script.src = '/opencv.js';
      document.body.appendChild(script);
    }
  }, [window['cv']]);
};
