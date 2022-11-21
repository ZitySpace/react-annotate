import { createContext } from 'react';
import { createStore, StoreApi } from 'zustand';

interface StoreData {
  skeleton: { [category: string]: [number, number][] };
}

const StoreDataDefault = { skeleton: {} };

interface Store extends StoreData {
  setConfig: (c: StoreData) => void;
}

const store = createStore<Store>((set) => ({
  ...StoreDataDefault,
  setConfig: (c) => set(c),
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  Store as KeypointsLabelConfigStoreProps,
  store as KeypointsLabelConfigStore,
  StoreContext as KeypointsLabelConfigStoreContext,
};
