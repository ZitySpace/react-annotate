import { createContext } from 'react';
import { createStore, State, StoreApi } from 'zustand';
import { Label } from '../classes/Label';
import produce from 'immer';

interface CanvasState extends Array<Label> {}

interface StoreData extends State {
  stack: CanvasState[];
  index: number;
}

const StoreCoreDefault = {
  stack: [],
  index: 1,
};

interface Store extends StoreData {
  canRedo: () => boolean;
  canUndo: () => boolean;
  canReset: () => boolean;
  canSave: () => boolean;

  curState: () => CanvasState;
  setStack: (stack: CanvasState[]) => boolean;
  pushState: (state: CanvasState) => boolean;
  undo: () => boolean;
  redo: () => boolean;
  reset: () => boolean;

  deleteObjects: (ids: number[]) => boolean;
  renameCategory: (oldCategory: string, newCategory: string) => void;
}

const store = createStore<Store>((set, get) => ({
  ...StoreCoreDefault,
  canRedo: () => get().index < get().stack.length,
  canUndo: () => get().index > 1,
  canReset: () => get().stack.length > 1,
  canSave: () => get().index > 1 || get().index < get().stack.length,

  curState: () => get().stack[get().index - 1] || [],
  setStack: (stack) => {
    set({ stack, index: stack.length });
    return true;
  },
  pushState: (state) => {
    const stack = get().stack.slice(0, get().index);
    stack.push(state);
    set({ stack, index: stack.length });
    return true;
  },
  undo: () => {
    set((s: Store) => ({ index: s.canUndo() ? s.index - 1 : s.index }));
    return true;
  },
  redo: () => {
    set((s: Store) => ({ index: s.canRedo() ? s.index + 1 : s.index }));
    return true;
  },
  reset: () => {
    if (get().canReset()) {
      set((s: Store) => ({ index: get().index !== 1 ? 1 : s.stack.length }));
    }
    return true;
  },
  deleteObjects: (ids) => {
    const curState = get().curState();
    const newState = curState.filter(
      ({ id }: { id: number }) => !ids.includes(id)
    );
    return newState.length == curState.length
      ? false
      : get().pushState(newState);
  },
  renameCategory: (oldName: string, newName: string) => {
    set(
      produce((s: Store) => {
        s.curState().forEach((label: Label) => {
          label.category =
            label.category === oldName ? newName : label.category;
        });
      })
    );
  },
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  Store as CanvasStoreProps,
  store as CanvasStore,
  StoreContext as CanvasStoreContext,
  CanvasState,
};
