import { fabric } from 'fabric';
import { createContext } from 'react';
import { createStore, State, StoreApi } from 'zustand';

interface Size {
  w: number;
  h: number;
}

interface StoreData extends State {
  canvas: fabric.Canvas | null;
  initSize: Size | null;
}

const StoreDataDefault = {
  canvas: null,
  initSize: null,
};

interface Store extends StoreData {
  setCanvas: (c: fabric.Canvas) => void;
  setInitSize: (sz: Size) => void;
}

const store = createStore<Store>((set) => ({
  ...StoreDataDefault,
  setCanvas: (c) => set({ canvas: c }),
  setInitSize: (sz) => set({ initSize: sz }),
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  Store as CanvasMetaStoreProps,
  store as CanvasMetaStore,
  StoreContext as CanvasMetaStoreContext,
};
