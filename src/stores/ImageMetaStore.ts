import produce, { enableMapSet } from 'immer';
import { createContext } from 'react';
import { createStore, State, StoreApi } from 'zustand';
import { Boundary } from '../classes/Geometry/Boundary';
import { Dimension } from '../classes/Geometry/Dimension';
import { Point } from '../classes/Geometry/Point';
import { DataState } from '../interfaces/basic';

enableMapSet();

interface StoreData extends State {
  image: fabric.Image | null;
  name: string | null;
  dims: Dimension | null;
  scale: number;
  offset: Point;
  boundary: Boundary;
  dataReady: boolean;
  dataError: boolean;
  cached: Set<string>;
}

const StoreDataDefault = {
  image: null,
  name: null,
  dims: null,
  scale: 1,
  offset: new Point(0, 0),
  boundary: new Boundary(0, 0, 0, 0),
  dataReady: false,
  dataError: false,
  cached: new Set<string>(),
};

interface Store extends StoreData {
  setImage: (image: fabric.Image, name: string | null) => void;
  setImageMeta: ({
    dims,
    scale,
    offset,
    boundary,
  }: {
    dims?: Dimension;
    scale?: number;
    offset?: Point;
    boundary?: Boundary;
  }) => void;
  setDataLoadingState: (state: DataState) => void;
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
  setImageMeta: (meta) => {
    // remove keys with value == undefined
    Object.keys(meta).forEach((k) => meta[k] === undefined && delete meta[k]);
    set(meta);
  },
  setDataLoadingState: (state: DataState = DataState.Loading) => {
    const dataReady = state === DataState.Ready;
    const dataError = state === DataState.Error;
    set({ dataReady, dataError });
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
