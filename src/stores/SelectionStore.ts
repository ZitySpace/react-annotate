import { createContext } from 'react';
import { createStore, State, StoreApi } from 'zustand';
import { Label, LabelType } from '../classes/Label';
import { mostRepeatedValue } from '../utils';

interface StoreData extends State {
  multi: boolean;
  AIMode: boolean;
  drawType: LabelType;
  visibleType: LabelType[];
  category: string | null;
  objects: Label[];
}

const StoreDataDefault = {
  multi: false,
  AIMode: false,
  drawType: LabelType.None,
  visibleType: Object.keys(LabelType).map((key) => LabelType[key]),
  category: null,
  objects: [],
};

interface Store extends StoreData {
  setDrawType: (drawType?: LabelType) => void;
  selectObjects: (objects?: Label[], keepCategory?: boolean) => void;
  toggleMulti: () => void;
  toggleVisibility: () => void;
  toggleAIMode: () => void;
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

  selectObjects: (objs = [], keepCategory = false) => {
    if (keepCategory) set({ drawType: LabelType.None, objects: objs });
    else
      set({
        drawType: LabelType.None,
        objects: objs,
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

  toggleAIMode: () => set((s: Store) => ({ AIMode: !s.AIMode })),

  isVisible: (labelType, type, id, isShowText) => {
    const s = get();

    const globalCondition = s.visibleType.includes(labelType);
    const isPanoramic = !s.objects.length && !s.drawType;
    const filterPointsAndLinesOfPolygon = !(
      labelType === LabelType.Polygon && ['circle', 'line'].includes(type)
    );
    const filterTextAndMask = !['textbox', 'polygon'].includes(type);
    const isMatchId = s.objects.some((o: Label) => o.id === id);

    return (
      globalCondition &&
      ((isPanoramic && filterPointsAndLinesOfPolygon) ||
        (isMatchId &&
          (isShowText ? filterPointsAndLinesOfPolygon : filterTextAndMask)))
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
