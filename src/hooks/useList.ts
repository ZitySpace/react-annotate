import { useEffect, useMemo, useRef } from 'react';
import { useUpdate } from 'react-use';

export interface UseListReturnProps<T> {
  state: T;
  currentIndex: number;
  setIndex: (newIndex: number) => void;
  setList: (state: T) => void;
  updateState: (nowState: T, idx?: number) => void;
  next: () => void;
  prev: () => void;
}

export function useList<T>(
  initList: T[] = [],
  initIndex: number = 0
): UseListReturnProps<T> {
  const update = useUpdate();
  const list = useRef<T[]>(initList);
  const index = useRef(initIndex);

  // If new state list is shorter that before - switch to the last element
  useEffect(() => {
    if (list.current.length <= index.current) {
      index.current = list.current.length - 1;
      update();
    }
  }, [list.current.length]);

  const actions = useMemo(
    () => ({
      next: () => actions.setIndex(index.current + 1),
      prev: () => actions.setIndex(index.current - 1),

      setIndex: (newIndex: number) => {
        if (!list.current.length || newIndex === index.current) return;

        // it gives the ability to traverse the borders.
        index.current =
          newIndex >= 0
            ? newIndex % list.current.length
            : list.current.length + (newIndex % list.current.length);
        update();
      },

      setList: (state: T) => {
        const newIndex = list.current.length ? list.current.indexOf(state) : -1;

        if (newIndex === -1) {
          throw new Error(
            `State '${state}' is not a valid state (does not exist in state list)`
          );
        }

        index.current = newIndex;
        update();
      },

      updateState: (newState: T, idx: number = index.current) => {
        list.current.splice(idx, 1, newState);
        update();
      },
    }),
    [list.current, index]
  );

  return {
    state: list.current[index.current],
    currentIndex: index.current,
    ...actions,
  };
}
