import { createContext } from 'react';
import { createStore, State, StoreApi } from 'zustand';
import { Boundary } from '../classes/Geometry/Boundary';
import { Dimension } from '../classes/Geometry/Dimension';
import { Point } from '../classes/Geometry/Point';
import { DataState } from '../interfaces/basic';

interface StoreData extends State {
  image: fabric.Image | null;
  dims: Dimension | null;
  scale: number;
  offset: Point;
  boundary: Boundary;
  imageState: DataState;
  annosState: DataState;
  dataReady: boolean;
  dataError: boolean;
}

const StoreDataDefault = {
  image: null,
  dims: null,
  scale: 1,
  offset: new Point(0, 0),
  boundary: new Boundary(0, 0, 0, 0),
  imageState: DataState.Loading,
  annosState: DataState.Loading,
  dataReady: false,
  dataError: false,
};

interface Store extends StoreData {
  setImage: (image: fabric.Image) => void;
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
  setImage: (image) => set({ image }),
  setImageMeta: (meta) => {
    // remove keys with value == undefined
    Object.keys(meta).forEach((k) => meta[k] === undefined && delete meta[k]);
    set(meta);
  },
  setDataLoadingState: ({
    imageState: imageSt,
    annosState: annosSt,
  }: {
    imageState?: DataState;
    annosState?: DataState;
  }) => {
    const imageState = imageSt === undefined ? get().imageState : imageSt;
    const annosState = annosSt === undefined ? get().annosState : annosSt;
    const dataReady = [imageState, annosState].every(
      (s) => s === DataState.Ready
    );
    const dataError = [imageState, annosState].some(
      (s) => s === DataState.Error
    );
    set({ imageState, annosState, dataReady, dataError });
  },
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  Store as ImageMetaStoreProps,
  store as ImageMetaStore,
  StoreContext as ImageMetaStoreContext,
};
