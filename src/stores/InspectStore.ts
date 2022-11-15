import { createContext } from 'react';
import { createStore, StoreApi } from 'zustand';

interface StoreData {
  lgroup: string;
  rmode: { id: number; mode: string }[];
}

const StoreDataDefault = {
  lgroup: 'default',
  rmode: [],
};

interface Store extends StoreData {
  setLGroup: (g: string) => void;
  setRMode: (m: { id: number; mode: string }[]) => void;
}

const store = createStore<Store>((set) => ({
  ...StoreDataDefault,
  setLGroup: (g) => set({ lgroup: g }),
  setRMode: (m: { id: number; mode: string }[]) => set({ rmode: m }),
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  Store as InspectStoreProps,
  store as InspectStore,
  StoreContext as InspectStoreContext,
};
