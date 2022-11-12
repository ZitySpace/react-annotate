import produce, { enableMapSet } from 'immer';
import { createContext } from 'react';
import { createStore, StoreApi } from 'zustand';
import { DataState } from '../interfaces/basic';

enableMapSet();

interface StoreData {
  image: fabric.Image | null;
  name: string | null;
  size: { w: number; h: number } | null;
  scale: number;
  offset: { x: number; y: number };
  dataReady: boolean;
  dataError: boolean;
  cached: Set<string>;
  msg: string;
}

const StoreDataDefault = {
  image: null,
  name: null,
  size: null,
  scale: 1,
  offset: { x: 0, y: 0 },
  dataReady: false,
  dataError: false,
  cached: new Set<string>(),
  msg: '',
};

interface Store extends StoreData {
  setImage: (image: fabric.Image, name: string | null) => void;
  setImageSize: (w: number, h: number) => void;
  setScaleOffset: ({
    scale,
    offset,
  }: {
    scale: number;
    offset: { x: number; y: number };
  }) => void;
  setDataLoadingState: (state: DataState, msg?: string) => void;
  isCached: (name: string | null) => boolean;
  setName: (name: string | null) => void;
}

const store = createStore<Store>((set, get) => ({
  ...StoreDataDefault,
  setImage: (image, name = null) =>
    set(
      produce((s) => {
        s.image = image;
        s.name = name;
        name !== null && s.cached.add(name);
      })
    ),
  setImageSize: (w, h) => {
    set({ size: { w, h } });
  },
  setScaleOffset: ({ scale, offset }) => {
    set({ scale, offset });
  },
  setDataLoadingState: (
    state: DataState = DataState.Loading,
    msg: string = ''
  ) => {
    const dataReady = state === DataState.Ready;
    const dataError = state === DataState.Error;
    set({ dataReady, dataError, msg });
  },
  isCached: (name: string | null = null) =>
    name !== null && get().cached.has(name),
  setName: (name: string | null) => set({ name }),
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  Store as ImageMetaStoreProps,
  store as ImageMetaStore,
  StoreContext as ImageMetaStoreContext,
};
