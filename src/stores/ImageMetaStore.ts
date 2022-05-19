import { createContext } from 'react';
import { createStore, State, StoreApi } from 'zustand';
import { Dimension } from '../classes/Geometry/Dimension';
import { Boundary } from '../classes/Geometry/Boundary';
import { Point } from '../classes/Geometry/Point';

interface StoreData extends State {
  image: fabric.Image | null;
  dims: Dimension | null;
  scale: number;
  offset: Point;
  boundary: Boundary;
}

const StoreDataDefault = {
  image: null,
  dims: null,
  scale: 1,
  offset: new Point(0, 0),
  boundary: new Boundary(0, 0, 0, 0),
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
}

const store = createStore<Store>((set) => ({
  ...StoreDataDefault,
  setImage: (image) => set({ image }),
  setImageMeta: (meta) => {
    // remove keys with value == undefined
    Object.keys(meta).forEach((k) => meta[k] === undefined && delete meta[k]);
    set(meta);
  },
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  Store as ImageMetaStoreProps,
  store as ImageMetaStore,
  StoreContext as ImageMetaStoreContext,
};
