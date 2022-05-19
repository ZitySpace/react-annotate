import { createContext } from 'react';
import { createStore, State, StoreApi } from 'zustand';
import { Label, LabelType } from '../classes/Label';
import { mostRepeatedValue } from '../utils';

interface StoreData extends State {
  multi: boolean;
  drawType: LabelType;
  vizType: LabelType[];
  category: string | null;
  objects: Label[];
}

const StoreDataDefault = {
  multi: false,
  drawType: LabelType.None,
  vizType: Object.keys(LabelType).map((key) => LabelType[key]),
  category: null,
  objects: [],
};

interface Store extends StoreData {
  setDrawType: (drawType?: LabelType) => void;
  selectObjects: (objects?: Label[]) => void;
  toggleMulti: () => void;
  isVisible: (
    labelType: LabelType,
    type: string,
    id: number,
    isShowText: boolean
  ) => boolean;
  isSelected: (target: number | string) => boolean;
}

const store = createStore<Store>((set, get) => ({
  ...StoreDataDefault,

  setDrawType: (t = LabelType.None) =>
    set((s: Store) => ({ drawType: t, objects: t ? [] : s.objects })),

  selectObjects: (os = []) =>
    set({
      objects: os,
      category: mostRepeatedValue(os.map(({ category }) => category)) || null,
    }),

  toggleMulti: () => set((s: Store) => ({ multi: !s.multi })),

  isVisible: (labelType, type, id, isShowText) => {
    const s = get();
    return (
      (!s.objects.length &&
        !s.drawType &&
        !(
          labelType === LabelType.Polygon && ['circle', 'line'].includes(type)
        )) ||
      (s.objects.map(({ id }: { id: number }) => id).includes(id) &&
        (isShowText || !['textbox', 'polygon'].includes(type)))
    );
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
