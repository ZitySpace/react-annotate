import { fabric } from 'fabric';
import { useEffect, useMemo, useRef } from 'react';
import { useStore } from 'zustand';
import { Boundary } from '../classes/Geometry/Boundary';
import { Point } from '../classes/Geometry/Point';
import { Rect } from '../classes/Geometry/Rect';
import { Label } from '../classes/Label';
import { PolygonLabel } from '../classes/Label/PolygonLabel';
import {
  CanvasMetaStore,
  CanvasMetaStoreProps,
} from '../stores/CanvasMetaStore';
import {
  CanvasState,
  CanvasStore,
  CanvasStoreProps,
} from '../stores/CanvasStore';
import { ImageMetaStore, ImageMetaStoreProps } from '../stores/ImageMetaStore';
import { SelectionStore, SelectionStoreProps } from '../stores/SelectionStore';
import {
  isEndpoint,
  isLabel,
  isRect,
  newLabel,
  updateEndpointAssociatedLinesPosition,
} from '../utils/label';
import { ColorStore, ColorStoreProps } from '../stores/ColorStore';
import { STROKE_WIDTH } from '../interfaces/config';

export const useCanvas = (dataReady: boolean) => {
  const [curState, pushState] = useStore(CanvasStore, (s: CanvasStoreProps) => [
    s.curState(),
    s.pushState,
  ]);

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
    category: selectedCategory,
    isSelected,
    selectObjects,
    isVisible,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  const getColor = useStore(ColorStore, (s: ColorStoreProps) => s.getColor);

  const listenersRef = useRef<object>({});
  const listeners = listenersRef.current;

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

  const addPointToPolygon = (obj: fabric.Circle) => {
    if (!canvas) return;
    const { left, top, _id, polygon } = obj as any;
    polygon.points.splice(_id + 1, 0, new Point(left, top));

    const oldObjs = canvas.getObjects().filter((o: any) => o.id === polygon.id);
    const newObjs = new PolygonLabel({
      obj: polygon,
      scale,
      offset,
    }).getFabricObjects(getColor(polygon.category), false);

    const theEndpoint = newObjs.find(
      (o: any) => o._id === _id + 1 && o.type === 'circle'
    );
    (obj as any).set({ hoverCursor: 'move', counterpart: theEndpoint });

    canvas.remove(...oldObjs).add(...newObjs);
    methods.syncCanvasToState();
  };

  // Sync state to canvas & focus if state changed
  useEffect(() => {
    if (!dataReady) return;

    methods.syncStateToCanvas(curState); // sync state
    selectObjects(curState.filter((label) => isSelected(label.id))); // sync focus
  }, [JSON.stringify(curState), dataReady]); // Deep compare

  // Set objects' visibale attribute in canvas when drawingType or focus changed
  useEffect(() => {
    if (!canvas) return;

    const adjustMode = selectedObjects.length === 1;

    !(drawType || selectedObjects.length || selectedCategory) &&
      updateAllTextboxPosition();

    if (drawType || !adjustMode) canvas.discardActiveObject();

    canvas.forEachObject((obj: any) => {
      obj.visible = isVisible(
        obj.labelType,
        obj.type,
        obj.id,
        !(drawType || adjustMode)
      );

      if ((drawType || adjustMode) && isSelected(obj.id) && isRect(obj))
        canvas.setActiveObject(obj);
    });

    canvas.requestRenderAll();
  }, [drawType, visibleType, selectedObjects, selectedCategory]);

  // Initialize image
  useEffect(() => {
    if (!canvas) return;

    if (dataReady && imageObj)
      canvas
        .setBackgroundImage(imageObj, () => {})
        .setViewportTransform([1, 0, 0, 1, 0, 0]);
    else canvas.clear();
  }, [imageObj, dataReady]);

  const methods = useMemo(
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
          const { category } = anno;
          const currentColor = getColor(category!);
          const fabricObjects = anno.getFabricObjects(currentColor);
          canvas.add(...fabricObjects);
        });
        canvas.requestRenderAll();
      },

      /**
       * Load event listeners to canvas.
       * @param newListeners listeners object which want to load
       */
      loadListeners: (newListeners: object) => {
        if (!canvas) return;
        Object.assign(listeners, newListeners); // save new listeners and replace old listeners
        canvas.off(); // remove all existed listeners
        Object.entries(listeners).forEach(([event, handler]) => {
          canvas.on(event, handler);
        });
      },
    }),
    [canvas, scale, offset]
  );

  // set default listeners and must after declare actions otherwise it will not work
  Object.assign(listeners, {
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

    // after modifying the object on the canvas, synchronizes the canvas to the state
    'object:modified': (e: fabric.IEvent) => {
      const { target } = e;
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
      methods.syncCanvasToState();
    },

    // Sync canvas's selection to focus, or if the midpoint is selected, add it as a endpoint to the associated polygon
    'selection:updated': (e: any) => {
      const target = e.selected[0];
      if (target.type === 'midpoint')
        addPointToPolygon(target as fabric.Circle);
    },

    'selection:created': (e: any) => {
      const target = e.selected[0];
      if (target.type === 'midpoint')
        addPointToPolygon(target as fabric.Circle);
      else {
        const obj = target?.polygon || target;
        const anno = newLabel({ obj, offset, scale });
        selectObjects([anno]);
      }
    },

    'selection:cleared': (e: any) => e.e && selectObjects(),
  });

  canvas && methods.loadListeners(listeners); // If canvas no null, mount listeners
  return { ...methods };
};
