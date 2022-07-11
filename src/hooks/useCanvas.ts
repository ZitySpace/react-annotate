import { fabric } from 'fabric';
import { useStore } from 'zustand';
import {
  CanvasMetaStore,
  CanvasMetaStoreProps,
} from '../stores/CanvasMetaStore';
import { ImageMetaStore, ImageMetaStoreProps } from '../stores/ImageMetaStore';
import { SelectionStore, SelectionStoreProps } from '../stores/SelectionStore';
import {
  isEndpoint,
  isMidpoint,
  isRect,
  newLabel,
  updateCoords,
  updateEndpointAssociatedLinesPosition,
} from '../utils/label';
import { STROKE_WIDTH } from '../interfaces/config';
import { LabeledObject, newLabelFromCanvasObject } from '../labels';

export const useCanvas = (syncCanvasToState: () => void) => {
  const canvas = useStore(
    CanvasMetaStore,
    (s: CanvasMetaStoreProps) => s.canvas
  );

  const {
    size: imageSize,
    scale,
    offset,
  } = useStore(ImageMetaStore, (s: ImageMetaStoreProps) => s);

  const { labels: selectedLabels, selectLabels } = useStore(
    SelectionStore,
    (s: SelectionStoreProps) => s
  );

  const listeners = {
    'object:moving': (e: fabric.IEvent) => {
      canvas?.requestRenderAll();
    },

    'object:modified': ({
      e,
      target,
    }: {
      e: fabric.IEvent<MouseEvent>;
      target: LabeledObject;
    }) => {
      if (e && target) {
        syncCanvasToState();
      }
    },

    'selection:created': ({
      e,
      selected,
    }: {
      e: fabric.IEvent<MouseEvent>;
      selected: LabeledObject[];
    }) => {
      if (e && !selectedLabels.length) {
        const anno = newLabelFromCanvasObject({
          obj: selected[0],
          scale,
          offset,
        })!;
        selectLabels([anno]);
      }
    },

    'selection:cleared': ({
      e,
      deselected,
    }: {
      e: fabric.IEvent<MouseEvent>;
      deselected: LabeledObject[];
    }) => {
      e && selectLabels([]);
    },
  };

  return listeners;
};
