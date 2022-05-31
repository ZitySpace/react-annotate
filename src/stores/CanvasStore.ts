import { createContext } from 'react';
import { createStore, State, StoreApi } from 'zustand';
import { Label } from '../classes/Label';
import produce from 'immer';

interface CanvasState extends Array<Label> {}

interface StoreData extends State {
  stack: CanvasState[];
  index: number;
  canRedo: boolean;
  canUndo: boolean;
  canReset: boolean;
  canSave: boolean;
}

const StoreCoreDefault = {
  stack: [],
  index: 1,
  canRedo: false,
  canUndo: false,
  canReset: false,
  canSave: false,
};

interface Store extends StoreData {
  curState: () => CanvasState;
  setStack: (stack: CanvasState[]) => boolean;
  pushState: (state: CanvasState) => boolean;
  undo: () => boolean;
  redo: () => boolean;
  reset: () => boolean;

  deleteObjects: (ids: number[]) => boolean;
  renameCategory: (oldCategory: string, newCategory: string) => void;
}

const store = createStore<Store>((set, get) => {
  const update = (stack: CanvasState[], index: number) => {
    set({
      stack,
      index,
      canRedo: index < stack.length,
      canUndo: index > 1,
      canReset: stack.length > 1,
      canSave: index > 1 || index < stack.length,
    });
    return true;
  };

  return {
    ...StoreCoreDefault,

    curState: () => get().stack[get().index - 1] || [],
    setStack: (stack) => update(stack, stack.length),
    pushState: (state) => {
      const stack = get().stack.slice(0, get().index);
      stack.push(state);
      return update(stack, stack.length);
    },
    undo: () => {
      const { stack, index, canUndo } = get();
      return update(stack, canUndo ? index - 1 : index);
    },
    redo: () => {
      const { stack, index, canRedo } = get();
      return update(stack, canRedo ? index + 1 : index);
    },
    reset: () => {
      const { stack, index, canReset } = get();
      if (canReset) update(stack, index !== 1 ? 1 : stack.length);
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
  };
});

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  Store as CanvasStoreProps,
  store as CanvasStore,
  StoreContext as CanvasStoreContext,
  CanvasState,
};
