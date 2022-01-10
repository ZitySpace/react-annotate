import { useMemo, useRef } from 'react'
import { useUpdate, useUpdateEffect } from 'react-use'
import { resolveHookState } from 'react-use/lib/misc/hookState'
import { Label } from '../interface/basic'
import { groupBy } from '../utils/categorys&colors'

interface Can {
  redo: boolean
  undo: boolean
  reset: boolean
  save: boolean
}

interface State extends Array<Label> {}

export const useStateStack = (initialState: State = []) => {
  const stack = useRef<State[]>(resolveHookState([initialState] || []))
  const can = useRef<Can>({
    redo: false,
    undo: false,
    reset: false,
    save: false
  })
  const index = useRef<number>(0)

  const update = useUpdate()

  useUpdateEffect(() => {
    can.current = {
      redo: index.current < stack.current.length,
      undo: index.current > 1,
      reset: stack.current.length > 1,
      save: index.current > 1 || index.current < stack.current.length
    }
    update()
  }, [stack.current.length, index.current])

  const actions = useMemo(
    () => ({
      nowState: stack.current[index.current - 1],
      set: (newStack: State[]) => {
        stack.current = resolveHookState(newStack, stack.current)
        index.current = stack.current.length
        update()
      },

      push: (newState: State) => {
        const newStack = stack.current.slice(0, index.current)
        index.current = newStack.push(newState)
        actions.set(newStack)
      },

      prev: () => {
        index.current -= can.current.undo ? 1 : 0
      },

      next: () => {
        index.current += can.current.redo ? 1 : 0
      },

      reset: () => {
        if (can.current.reset)
          index.current = index.current !== 1 ? 1 : stack.current.length
      },

      grouped: () =>
        actions.nowState ? groupBy(actions.nowState, 'categoryName') : {}
    }),
    [stack.current, index.current, can.current]
  )

  return {
    currentIndex: index.current,
    ...actions
  }
}
