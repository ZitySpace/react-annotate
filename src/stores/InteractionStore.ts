import { createContext } from 'react';
import { createStore, State, StoreApi } from 'zustand';

type Mode = 'none' | 'panning' | 'drawing' | 'modifying';

interface StoreData extends State {
  mode: Mode;
}

const StoreDataDefault = {
  mode: 'none' as Mode,
};

interface Store extends StoreData {
  setMode: (m: Mode) => void;
}

const store = createStore<Store>((set) => ({
  ...StoreDataDefault,
  setMode: (m) => set({ mode: m }),
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  Store as InteractionStoreProps,
  store as InteractionStore,
  StoreContext as InteractionStoreContext,
};
