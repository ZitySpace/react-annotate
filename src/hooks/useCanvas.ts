import { fabric } from 'fabric';
import { useMemo } from 'react';
import { useStore } from 'zustand';
import { Boundary } from '../classes/Geometry/Boundary';
import { Point } from '../classes/Geometry/Point';
import { Rect } from '../classes/Geometry/Rect';
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
  updateEndpointAssociatedLinesPosition,
} from '../utils/label';
import { STROKE_WIDTH } from '../interfaces/config';

export const useCanvas = (syncCanvasToState: () => void) => {
  const canvas = useStore(
    CanvasMetaStore,
    (s: CanvasMetaStoreProps) => s.canvas
  );

  const {
    boundary: imageBoundary,
    scale,
    offset,
  } = useStore(ImageMetaStore, (s: ImageMetaStoreProps) => s);

  const { selectObjects } = useStore(
    SelectionStore,
    (s: SelectionStoreProps) => s
  );

  /**
   * Update polygon's if the obj is polygon's endpoint
   */
  const updateEndpointAssociatedPolygon = (obj: fabric.Object) => {
    const { left, top, polygon, _id } = obj as any;
    if (isEndpoint(obj) && polygon) polygon.points[_id] = new Point(left, top);
  };

  // set default listeners and must after declare actions otherwise it will not work
  const listeners = useMemo(
    () => ({
      // when canvas's object is moving, ensure its position is in the image boundary
      // and sync the position of its line/polygon if the object is a endpoint
      'object:moving': (e: fabric.IEvent) => {
        const obj = e.target as fabric.Object;

        const { x, y, w, h } = imageBoundary;
        const _imgBoundary = new Boundary(x, y, w, h); // deep clone to avoid rect-type calculate influences
        // rect's boundary need consider of its dimensions
        if (isRect(obj)) {
          _imgBoundary._x -= obj.getScaledWidth();
          _imgBoundary._y -= obj.getScaledHeight();
        }
        // as for other types label, they controlled by its endpoint
        const target = (obj as any).counterpart || obj; // if the object has counterpart, use it
        target.set(_imgBoundary.within(obj));
        target.setCoords();
        updateEndpointAssociatedLinesPosition(target, true);
        updateEndpointAssociatedPolygon(target);
        canvas?.requestRenderAll();
      },

      // after modifying the object on the canvas,
      // restrict the rectangle's position to be within the image boundary via tailoring
      // and synchronizes the canvas to the state
      'object:modified': (e: fabric.IEvent) => {
        const { target } = e;
        if (isMidpoint(target)) return;
        if (isRect(target)) {
          const { left, top } = target as fabric.Rect;
          const [width, height] = [
            target?.getScaledWidth(),
            target?.getScaledHeight(),
          ];
          const rect = imageBoundary.intersection(
            new Rect(left!, top!, width!, height!)
          );
          const { x, y, w, h } = rect;
          target?.set({
            left: x,
            top: y,
            width: w - STROKE_WIDTH,
            height: h - STROKE_WIDTH,
            scaleX: 1,
            scaleY: 1,
          });
        }
        syncCanvasToState();
      },

      // Sync canvas's selection to selection store
      'selection:created': (e: any) => {
        const target = e.selected[0];
        const obj = target?.polygon || target;
        const anno = newLabel({ obj, offset, scale });
        selectObjects([anno]);
      },
      'selection:cleared': (e: any) => e.e && selectObjects(),
    }),
    [canvas, imageBoundary]
  );

  return listeners;
};
