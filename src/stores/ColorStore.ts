import randomColor from 'randomcolor';
import produce from 'immer';
import { createContext } from 'react';
import { createStore, StoreApi } from 'zustand';

const colorMapDefault = randomColor({
  seed: 19,
  format: 'rgba',
  alpha: 0.75,
  count: 16,
});

const makeRandomColor = () =>
  randomColor({
    seed: Date.now() % 100,
    format: 'rgba',
    alpha: 0.75,
    count: Date.now() % 10,
  })[Math.floor(Math.random() * 10)];

interface StoreData {
  colors: {
    [key: string]: string;
  };
}

const StoreDataDefault = {
  colors: {},
};

interface Store extends StoreData {
  newColor: () => string;
  getColor: (key: string, inColorMapDefault?: boolean) => string;
  setColor: (key: string, color: string) => void;
  renameKey: (keyOld: string, keyNew: string) => void;
  hasKey: (key: string) => boolean;
}

const store = createStore<Store>((set, get) => ({
  ...StoreDataDefault,

  newColor: () => {
    const { colors } = get();
    let color = makeRandomColor();
    while (Object.values(colors).includes(color)) color = makeRandomColor();
    return color;
  },

  getColor: (key, inColorMapDefault = true) => {
    const { colors, newColor } = get();

    // color already registered
    if (colors.hasOwnProperty(key)) return colors[key];

    // use a non-assigned color from default cmap
    // otherwise, based on inColorMapDefault use
    // an assigned color from default cmap or a new color
    const nonAssigned = colorMapDefault.find(
      (c) => !Object.values(colors).includes(c)
    );
    const color =
      nonAssigned ||
      (inColorMapDefault
        ? colorMapDefault[Object.keys(colors).length % colorMapDefault.length]
        : newColor());

    set({ colors: { ...colors, [key]: color } });
    return color;
  },

  setColor: (key, color) =>
    set((s: Store) => ({ colors: { ...s.colors, [key]: color } })),

  renameKey: (oldKey, newKey) =>
    set(
      produce((s: Store) => {
        if (s.colors.hasOwnProperty(oldKey)) {
          if (!s.colors.hasOwnProperty(newKey))
            s.colors[newKey] = s.colors[oldKey];
          delete s.colors[oldKey];
        }
      })
    ),

  hasKey: (key) => get().colors.hasOwnProperty(key),
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  Store as ColorStoreProps,
  store as ColorStore,
  StoreContext as ColorStoreContext,
};
