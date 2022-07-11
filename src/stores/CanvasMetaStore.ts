import { fabric } from 'fabric';
import { createContext } from 'react';
import { createStore, State, StoreApi } from 'zustand';

interface StoreData extends State {
  canvas: fabric.Canvas | null;
  initSize: { w: number; h: number } | null;
}

const StoreDataDefault = {
  canvas: null,
  initSize: null,
};

interface Store extends StoreData {
  setCanvas: (c: fabric.Canvas) => void;
  setInitSize: (w: number, h: number) => void;
}

const store = createStore<Store>((set) => ({
  ...StoreDataDefault,
  setCanvas: (c) => set({ canvas: c }),
  setInitSize: (w, h) => set({ initSize: { w, h } }),
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  Store as CanvasMetaStoreProps,
  store as CanvasMetaStore,
  StoreContext as CanvasMetaStoreContext,
};
