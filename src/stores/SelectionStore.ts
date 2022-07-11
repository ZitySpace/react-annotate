import { createContext } from 'react';
import { createStore, State, StoreApi } from 'zustand';
import { Label, LabelType } from '../labels';
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
  isVisible: (canvasObject: any) => boolean;
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
    !get().drawType &&
    set((s: Store) => ({
      visibleType: s.visibleType.length ? [] : StoreDataDefault.visibleType,
    })),

  isVisible: (canvasObject) => {
    const s = get();

    const inVisibleType = s.visibleType.includes(canvasObject.labelType);

    if (!inVisibleType) return false;

    if (s.drawType) return false;

    if (!s.labels.length)
      return !(
        canvasObject.labelType === LabelType.Polygon &&
        ['circle', 'line'].includes(canvasObject.type)
      );

    if (s.labels.some((o) => o.id === canvasObject.id)) {
      if (s.labels.length > 1)
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
