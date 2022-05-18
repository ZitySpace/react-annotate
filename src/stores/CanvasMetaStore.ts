import { fabric } from 'fabric';
import { createContext } from 'react';
import { createStore, State, StoreApi } from 'zustand';
import { Dimension } from '../classes/Geometry/Dimension';

interface StoreData extends State {
  canvas: fabric.Canvas | null;
  initDims: Dimension | null;
}

const StoreDataDefault = {
  canvas: null,
  initDims: null,
};

interface Store extends StoreData {
  setCanvas: (c: fabric.Canvas) => void;
  setInitDims: (dims: Dimension) => void;
}

const store = createStore<Store>((set) => ({
  ...StoreDataDefault,
  setCanvas: (c) => set({ canvas: c }),
  setInitDims: (dims) => set({ initDims: dims }),
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  Store as CanvasMetaStoreProps,
  store as CanvasMetaStore,
  StoreContext as CanvasMetaStoreContext,
};
