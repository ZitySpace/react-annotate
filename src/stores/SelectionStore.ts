import { createContext } from 'react';
import { createStore, State, StoreApi } from 'zustand';
import { Label, LabelType } from '../classes/Label';
import { mostRepeatedValue } from '../utils';

type OperationStatus = 'none' | 'panning' | 'drawing' | 'adjusting';

interface StoreData extends State {
  multi: boolean;
  operationStatus: OperationStatus;
  drawType: LabelType;
  visibleType: LabelType[];
  category: string | null;
  objects: Label[];
}

const NoObjectsSelected: Label[] = [];

const StoreDataDefault = {
  multi: false,
  operationStatus: 'none' as OperationStatus,
  drawType: LabelType.None,
  visibleType: Object.keys(LabelType).map((key) => LabelType[key]),
  category: null,
  objects: NoObjectsSelected,
};

interface Store extends StoreData {
  setDrawType: (drawType?: LabelType) => void;
  setOperationStatus: (operationStatus: OperationStatus) => void;
  selectObjects: (objects?: Label[], keepCategory?: boolean) => void;
  toggleMulti: () => void;
  toggleVisibility: () => void;
  isVisible: (canvasObject: any) => boolean;
  isSelected: (target: number | string) => boolean;
}

const store = createStore<Store>((set, get) => ({
  ...StoreDataDefault,

  setDrawType: (t = LabelType.None) =>
    set((s: Store) => ({
      drawType: t,
      objects: t ? NoObjectsSelected : s.objects,
      operationStatus: 'none',
    })),

  setOperationStatus: (operationStatus: OperationStatus) =>
    set(() => ({ operationStatus })),

  selectObjects: (objs = NoObjectsSelected, keepCategory = false) => {
    if (keepCategory)
      set({
        drawType: LabelType.None,
        objects: objs.length ? objs : NoObjectsSelected,
      });
    else
      set({
        drawType: LabelType.None,
        objects: objs.length ? objs : NoObjectsSelected,
        category:
          mostRepeatedValue(objs.map(({ category }) => category)) || null,
      });
  },

  toggleMulti: () => set((s: Store) => ({ multi: !s.multi })),

  toggleVisibility: () =>
    !get().drawType &&
    set((s: Store) => ({
      visibleType: s.visibleType.length ? [] : StoreDataDefault.visibleType,
    })),

  isVisible: (canvasObject) => {
    const s = get();

    const inVisibleType = s.visibleType.includes(canvasObject.labelType);

    if (!inVisibleType) return false;

    if (s.drawType) return false;

    if (!s.objects.length)
      return !(
        canvasObject.labelType === LabelType.Polygon &&
        ['circle', 'line'].includes(canvasObject.type)
      );

    if (s.objects.some((o) => o.id === canvasObject.id)) {
      if (s.objects.length > 1)
        return !(
          canvasObject.labelType === LabelType.Polygon &&
          ['circle', 'line'].includes(canvasObject.type)
        );
      else return !['textbox', 'polygon'].includes(canvasObject.type);
    }

    return false;
  },

  isSelected: (t) =>
    typeof t === 'string'
      ? get().objects.some(
          ({ category }: { category: string }) => category === t
        )
      : get().objects.some(({ id }: { id: number }) => id === t),
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  Store as SelectionStoreProps,
  store as SelectionStore,
  StoreContext as SelectionStoreContext,
};
