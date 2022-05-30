import { useMemo, useRef } from 'react';
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
import { ImageMetaStore, ImageMetaStoreProps } from '../stores/ImageMetaStore';
import { SelectionStore, SelectionStoreProps } from '../stores/SelectionStore';
import { isLabel, newLabel } from '../utils/label';

export const useSynchronizer = () => {
  const canvas = useStore(
    CanvasMetaStore,
    (s: CanvasMetaStoreProps) => s.canvas
  );

  const { scale, offset } = useStore(
    ImageMetaStore,
    (s: ImageMetaStoreProps) => s
  );

  const pushState = useStore(CanvasStore, (s: CanvasStoreProps) => s.pushState);

  const getColor = useStore(ColorStore, (s: ColorStoreProps) => s.getColor);

  const { isVisible } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

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

  return { syncStateToCanvas, syncCanvasToState };
};
