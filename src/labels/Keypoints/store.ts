import { createContext, useEffect } from 'react';
import { createStore, StoreApi, useStore } from 'zustand';

interface StoreData {
  pids: number[];
}

const NoPidsSelected: number[] = [];

const StoreDataDefault = {
  pids: [],
};

interface Store extends StoreData {
  setPids: (pids?: number[]) => void;
}

const store = createStore<Store>((set) => ({
  ...StoreDataDefault,
  setPids: (pids = NoPidsSelected) => set({ pids }),
}));

const StoreContext = createContext<StoreApi<Store>>(store);

const useLabelStore = () => {
  const { pids } = useStore(store, (s: Store) => s);

  return {
    dynamicArgs: [pids],
  };
};

export {
  Store as KeypointsStoreProps,
  store as KeypointsStore,
  StoreContext as KeypointsStoreContext,
  useLabelStore as useKeypointsLabelStore,
};
