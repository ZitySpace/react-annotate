import { useStore } from 'zustand';
import {
  CanvasMetaStore,
  CanvasMetaStoreProps,
} from '../../stores/CanvasMetaStore';
import { CanvasStore, CanvasStoreProps } from '../../stores/CanvasStore';
import {
  ImageMetaStore,
  ImageMetaStoreProps,
} from '../../stores/ImageMetaStore';
import {
  SelectionStore,
  SelectionStoreProps,
} from '../../stores/SelectionStore';
import { ColorStore, ColorStoreProps } from '../../stores/ColorStore';
import { ListenerStore, ListenerStoreProps } from '../../stores/ListenerStore';
import { Label, LabeledObject, LabelType } from '../Base';
import { newLabelFromCanvasObject } from '../utils/listeners';

export const setup = () => {
  const { canvas, initSize: canvasInitSize } = useStore(
    CanvasMetaStore,
    (s: CanvasMetaStoreProps) => s
  );

  const {
    curState,
    pushState,
    setLock: setStateOpsLock,
  } = useStore(CanvasStore, (s: CanvasStoreProps) => s);

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

  const {
    lastPosition,
    origPosition,
    isPanning,
    isDrawing,
    isEditing,
    isObjectMoving,
    listenerGroup,
    trySwitchGroup: trySwitchGroupRef,
    setListeners: setListenersRef,
    refreshListeners: refreshListenersRef,
    resetListeners: resetListenersRef,
  } = useStore(ListenerStore, (s: ListenerStoreProps) => s);

  const inImageOI = (x: number, y: number) =>
    x >= offset.x &&
    y >= offset.y &&
    x + offset.x < canvasInitSize!.w &&
    y + offset.y < canvasInitSize!.h;

  const selectCanvasObject = (obj: LabeledObject) => {
    const label = newLabelFromCanvasObject({
      scale,
      offset,
      ...([LabelType.Polyline, LabelType.Mask, LabelType.Keypoints].includes(
        obj.labelType
      )
        ? {
            grp: canvas?.getObjects().filter((o) => {
              const { id, syncToLabel } = o as LabeledObject;
              return id === obj.id && syncToLabel;
            }) as LabeledObject[],
          }
        : { obj }),
    });
    selectLabels(label ? [label] : []);
  };

  return {
    canvas,
    canvasInitSize,
    curState: curState(),
    pushState,
    setStateOpsLock,
    imageSize,
    scale,
    offset,
    drawType,
    setDrawType,
    selectedLabels,
    selectLabels,
    selectedCategory,
    getColor,
    lastPosition,
    origPosition,
    isPanning,
    isDrawing,
    isEditing,
    isObjectMoving,
    listenerGroup,
    trySwitchGroupRef,
    setListenersRef,
    refreshListenersRef,
    resetListenersRef,
    inImageOI,
    selectCanvasObject,
  };
};
