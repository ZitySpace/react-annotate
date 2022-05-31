import { fabric } from 'fabric';
import { useEffect, useMemo } from 'react';
import { useStore } from 'zustand';
import { Boundary } from '../classes/Geometry/Boundary';
import { Point } from '../classes/Geometry/Point';
import { Rect } from '../classes/Geometry/Rect';
import {
  CanvasMetaStore,
  CanvasMetaStoreProps,
} from '../stores/CanvasMetaStore';
import { CanvasStore, CanvasStoreProps } from '../stores/CanvasStore';
import { ImageMetaStore, ImageMetaStoreProps } from '../stores/ImageMetaStore';
import { SelectionStore, SelectionStoreProps } from '../stores/SelectionStore';
import {
  isEndpoint,
  isLabel,
  isMidpoint,
  isRect,
  newLabel,
  updateEndpointAssociatedLinesPosition,
} from '../utils/label';
import { ColorStore, ColorStoreProps } from '../stores/ColorStore';
import { STROKE_WIDTH } from '../interfaces/config';
import { useSynchronizer } from './useSynchronizer';

export const useCanvas = (dataReady: boolean) => {
  console.log('useCanvas!');

  const curState = useStore(CanvasStore, (s: CanvasStoreProps) => s.curState());

  const canvas = useStore(
    CanvasMetaStore,
    (s: CanvasMetaStoreProps) => s.canvas
  );

  const {
    image: imageObj,
    boundary: imageBoundary,
    scale,
    offset,
  } = useStore(ImageMetaStore, (s: ImageMetaStoreProps) => s);

  const {
    drawType,
    visibleType,
    objects: selectedObjects,
    isSelected,
    selectObjects,
    isVisible,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  const getColor = useStore(ColorStore, (s: ColorStoreProps) => s.getColor);

  const { syncStateToCanvas, syncCanvasToState } = useSynchronizer();

  /**
   * Update polygon's if the obj is polygon's endpoint
   */
  const updateEndpointAssociatedPolygon = (obj: fabric.Object) => {
    const { left, top, polygon, _id } = obj as any;
    if (isEndpoint(obj) && polygon) polygon.points[_id] = new Point(left, top);
  };

  /**
   * Update all labels' text position in canvas via regenerate them
   */
  const updateAllTextboxPosition = () => {
    if (!canvas) return;
    const currentLabelObjs = canvas.getObjects().filter(isLabel);
    const newObjects = currentLabelObjs.map((obj: any) =>
      newLabel({ obj, offset, scale }).getFabricObjects(getColor(obj.category))
    );
    canvas.remove(...canvas.getObjects()).add(...newObjects.flat());
  };

  // Sync state to canvas & focus if state changed
  useEffect(() => {
    if (!dataReady) return;

    syncStateToCanvas(curState); // sync state
    selectObjects(
      curState.filter(({ id }) => isSelected(id)),
      true
    ); // sync to the selection
  }, [JSON.stringify(curState), dataReady]); // Deep compare

  // Set objects' visibale attribute in canvas when drawingType or focus changed
  useEffect(() => {
    if (!canvas) return;

    const adjustMode = selectedObjects.length === 1;
    const isShowText = !(drawType || adjustMode);
    if (isShowText) updateAllTextboxPosition();

    if (drawType || !adjustMode) canvas.discardActiveObject();

    canvas.forEachObject((obj: any) => {
      obj.visible = isVisible(obj.labelType, obj.type, obj.id, isShowText);
    });

    const selectedRect = canvas
      .getObjects('rect')
      .filter((obj) => isSelected((obj as any).id));

    if (adjustMode && selectedRect.length)
      canvas.setActiveObject(selectedRect[0]);
    else canvas.discardActiveObject();

    canvas.requestRenderAll();
  }, [drawType, visibleType, selectedObjects]);

  // Initialize image
  useEffect(() => {
    if (!canvas) return;

    if (dataReady && imageObj)
      canvas
        .setBackgroundImage(imageObj, () => {})
        .setViewportTransform([1, 0, 0, 1, 0, 0]);
    else canvas.clear();
  }, [imageObj, dataReady]);

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

      // Sync canvas's selection to focus
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
