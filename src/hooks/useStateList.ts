import { useEffect, useMemo, useRef } from 'react';
import { useUpdate } from 'react-use';

export interface UseStateListReturnProps<T> {
  state: T;
  currentIndex: number;
  setIndex: (newIndex: number) => void;
  setList: (state: T) => void;
  updateState: (nowState: T, idx?: number) => void;
  next: () => void;
  prev: () => void;
}

export function useStateList<T>(
  list: T[] = [],
  initIndex: number = 0
): UseStateListReturnProps<T> {
  const update = useUpdate();
  const index = useRef(initIndex);

  // If new state list is shorter that before - switch to the last element
  useEffect(() => {
    if (list.length <= index.current) {
      index.current = list.length - 1;
      update();
    }
  }, [list.length]);

  const actions = useMemo(
    () => ({
      next: () => actions.setIndex(index.current + 1),
      prev: () => actions.setIndex(index.current - 1),

      setIndex: (newIndex: number) => {
        if (!list.length || newIndex === index.current) return;

        // it gives the ability to traverse the borders.
        index.current =
          newIndex >= 0
            ? newIndex % list.length
            : list.length + (newIndex % list.length);
        update();
      },

      setList: (state: T) => {
        const newIndex = list.length ? list.indexOf(state) : -1;

        if (newIndex === -1) {
          throw new Error(
            `State '${state}' is not a valid state (does not exist in state list)`
          );
        }

        index.current = newIndex;
        update();
      },

      updateState: (newState: T, idx: number = index.current) => {
        list.splice(idx, 1, newState);
        update();
      },
    }),
    [list, index]
  );

  return {
    state: list[index.current],
    currentIndex: index.current,
    ...actions,
  };
}
