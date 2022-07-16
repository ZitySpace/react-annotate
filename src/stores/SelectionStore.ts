import { createContext } from 'react';
import { createStore, State, StoreApi } from 'zustand';
import { Label, LabelType, LabelRenderMode } from '../labels';
import { mostRepeatedValue } from '../utils';

interface StoreData extends State {
  multi: boolean;
  drawType: LabelType;
  visibleType: LabelType[];
  category: string | null;
  labels: Label[];
}

const NoLabelsSelected: Label[] = [];

const StoreDataDefault = {
  multi: false,
  drawType: LabelType.None,
  visibleType: Object.keys(LabelType).map((key) => LabelType[key]),
  category: null,
  labels: NoLabelsSelected,
};

interface Store extends StoreData {
  setDrawType: (drawType?: LabelType) => void;
  selectLabels: (labels?: Label[], keepCategory?: boolean) => void;
  toggleMulti: () => void;
  toggleVisibility: () => void;
  calcLabelMode: (label: Label) => string;
  isSelected: (target: number | string) => boolean;
}

const store = createStore<Store>((set, get) => ({
  ...StoreDataDefault,

  setDrawType: (t = LabelType.None) =>
    set((s: Store) => ({
      drawType: t,
      labels: t ? NoLabelsSelected : s.labels,
    })),

  selectLabels: (labels = NoLabelsSelected, keepCategory = false) => {
    if (keepCategory)
      set({
        drawType: LabelType.None,
        labels: labels.length ? labels : NoLabelsSelected,
      });
    else
      set({
        drawType: LabelType.None,
        labels: labels.length ? labels : NoLabelsSelected,
        category:
          mostRepeatedValue(labels.map(({ category }) => category)) || null,
      });
  },

  toggleMulti: () => set((s: Store) => ({ multi: !s.multi })),

  toggleVisibility: () =>
    get().drawType === LabelType.None &&
    set((s: Store) => ({
      visibleType: s.visibleType.length ? [] : StoreDataDefault.visibleType,
    })),

  calcLabelMode: (label) => {
    const s = get();

    const oneOfVisibleTypes = s.visibleType.includes(label.labelType);

    if (!oneOfVisibleTypes || s.drawType !== LabelType.None)
      return LabelRenderMode.Hidden;

    if (!s.labels.length) return LabelRenderMode.Preview;

    if (s.labels.some((o) => o.id === label.id)) {
      if (s.labels.length > 1) return LabelRenderMode.Preview;
      else return LabelRenderMode.Selected;
    }

    return LabelRenderMode.Hidden;
  },

  isSelected: (t) =>
    typeof t === 'string'
      ? get().labels.some(
          ({ category }: { category: string }) => category === t
        )
      : get().labels.some(({ id }: { id: number }) => id === t),
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  Store as SelectionStoreProps,
  store as SelectionStore,
  StoreContext as SelectionStoreContext,
};
