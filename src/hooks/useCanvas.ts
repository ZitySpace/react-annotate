import { fabric } from 'fabric';
import { useEffect, useMemo, useRef } from 'react';
import { useStore } from 'zustand';
import { Boundary } from '../classes/Geometry/Boundary';
import { Point } from '../classes/Geometry/Point';
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
import { UseColorsReturnProps } from './useColor';

export const useCanvas = ({
  dataReady,
  annoColors,
}: {
  dataReady: boolean;
  annoColors: UseColorsReturnProps;
}) => {
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
      newLabel({ obj, offset, scale }).getFabricObjects(
        annoColors.get(obj.category)
      )
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
    }).getFabricObjects(annoColors.get(polygon.category), false);

    const theEndpoint = newObjs.find(
      (o: any) => o._id === _id + 1 && o.type === 'circle'
    );
    obj.set({ hoverCursor: 'move' }).on('moving', () => {
      const { left, top } = obj;
      (theEndpoint as fabric.Circle).set({ left, top });
      (theEndpoint as fabric.Circle).setCoords();
      updateEndpointAssociatedLinesPosition(theEndpoint as fabric.Circle, true);
      updateEndpointAssociatedPolygon(theEndpoint as fabric.Circle);
    });

    methods.syncCanvasToState();
    canvas.remove(...oldObjs).add(...newObjs);
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
        pushState && pushState(newState);
        setRenderLock(); // avoid useEffect hook invoke syncStateToCanvas method
      },

      syncStateToCanvas: (state: CanvasState) => {
        if (!canvas || getRenderLock()) return;
        console.log('syncStateToCanvas called'); // TODO: remove

        canvas.remove(...canvas.getObjects());
        state.forEach((anno: Label) => {
          const { category } = anno;
          const currentColor = annoColors.get(category!);
          // TODO: ensure visible
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
    [canvas]
  );

  // set default listeners and must after declare actions otherwise it will not work
  Object.assign(listeners, {
    // when canvas's object is moving, sync its line's position if the object is line's endpoint
    'object:moving': (e: fabric.IEvent) =>
      updateEndpointAssociatedLinesPosition(e.target!),

    // when canvas's object was moved, ensure its position is in the image boundary
    'object:modified': () => {
      const obj: any = canvas?.getActiveObject();
      const { x, y, _x, _y } = imageBoundary;
      const _imgBoundary = new Boundary(x, y, _x, _y); // deep clone to avoid rect-type calculate influences
      // rect's boundary need consider of its dimensions
      if (isRect(obj)) {
        _imgBoundary._x -= obj.getScaledWidth();
        _imgBoundary._y -= obj.getScaledHeight();
      }
      // as for other types label, they controlled by its endpoint
      obj.set(_imgBoundary.within(obj));
      updateEndpointAssociatedLinesPosition(obj, true);
      updateEndpointAssociatedPolygon(obj);

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
