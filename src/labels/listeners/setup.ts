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
import { LabeledObject } from '../Base';
import { newLabelFromCanvasObject } from '../utils/listeners';

export const setup = () => {
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

  const {
    lastPosition,
    origPosition,
    isPanning,
    isDrawing,
    isEditing,
    isObjectMoving,
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
      obj,
      scale,
      offset,
    })!;
    selectLabels([label]);
  };

  return {
    canvas,
    canvasInitSize,
    curState,
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
    trySwitchGroupRef,
    setListenersRef,
    refreshListenersRef,
    resetListenersRef,
    inImageOI,
    selectCanvasObject,
  };
};
