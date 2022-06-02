import { fabric } from 'fabric';
import { createContext } from 'react';
import { createStore, State, StoreApi } from 'zustand';
import { Dimension } from '../classes/Geometry/Dimension';
import { DataState } from '../interfaces/basic';

interface StoreData extends State {
  canvas: fabric.Canvas | null;
  initDims: Dimension | null;
  imageState: DataState;
  annosState: DataState;
}

const StoreDataDefault = {
  canvas: null,
  initDims: null,
  imageState: DataState.Loading,
  annosState: DataState.Loading,
};

interface Store extends StoreData {
  setCanvas: (c: fabric.Canvas) => void;
  setInitDims: (dims: Dimension) => void;
  setDataLoadingState: ({
    imageState,
    annosState,
  }: {
    imageState?: DataState;
    annosState?: DataState;
  }) => void;
}

const store = createStore<Store>((set, get) => ({
  ...StoreDataDefault,
  setCanvas: (c) => set({ canvas: c }),
  setInitDims: (dims) => set({ initDims: dims }),
  setDataLoadingState: ({
    imageState,
    annosState,
  }: {
    imageState?: DataState;
    annosState?: DataState;
  }) =>
    set({
      imageState: imageState === undefined ? get().imageState : imageState,
      annosState: annosState === undefined ? get().annosState : annosState,
    }),
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  Store as CanvasMetaStoreProps,
  store as CanvasMetaStore,
  StoreContext as CanvasMetaStoreContext,
};
