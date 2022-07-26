import { createContext } from 'react';
import { createStore, StoreApi } from 'zustand';
import { Label } from '../labels';
import { getLocalTimeISOString } from '../labels/utils/label';

type CanvasState = Array<Label>;

interface StoreData {
  stack: CanvasState[];
  index: number;
  canRedo: boolean;
  canUndo: boolean;
  canReset: boolean;
  canSave: boolean;
  lock: boolean;
}

const StoreCoreDefault = {
  stack: [[]],
  index: 1,
  canRedo: false,
  canUndo: false,
  canReset: false,
  canSave: false,
  lock: false,
};

interface Store extends StoreData {
  curState: () => CanvasState;
  setStack: (stack: CanvasState[]) => boolean;
  pushState: (state: CanvasState) => boolean;
  undo: () => boolean;
  redo: () => boolean;
  reset: () => boolean;
  updateCanSave: (canSave: boolean) => void;

  deleteObjects: (ids: number[]) => boolean;
  assignCategory: (ids: number[], category: string) => boolean;

  setLock: (lock: boolean) => void;
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
      lock: false,
    });
    return true;
  };

  return {
    ...StoreCoreDefault,

    curState: () => get().stack[get().index - 1],
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
    updateCanSave: (canSave: boolean) => set({ canSave }),
    deleteObjects: (ids) => {
      const curState = get().curState();
      const newState = curState.filter(
        ({ id }: { id: number }) => !ids.includes(id)
      );
      return newState.length == curState.length
        ? false
        : get().pushState(newState);
    },
    assignCategory: (ids, category) => {
      const curState = get().curState();

      const todo = curState.some(
        (label) => ids.includes(label.id) && label.category !== category
      );
      if (!todo) return false;

      const newState = curState.map((label) => label.clone());
      const now = getLocalTimeISOString();
      newState.forEach((label) => {
        if (ids.includes(label.id)) {
          label.category = category;
          label.timestamp = now;
        }
      });
      return get().pushState(newState);
    },
    setLock: (lock: boolean) => {
      set((s: Store) => ({
        lock,
        canRedo: !lock && s.index < s.stack.length,
        canUndo: !lock && s.index > 1,
        canReset: !lock && s.stack.length > 1,
      }));
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
