import { useEffect, useMemo, useRef, useState } from 'react'
import { useUpdate } from 'react-use'
import { resolveHookState } from 'react-use/lib/misc/hookState'
import { Label } from '../label/Label'
import { groupBy } from '../utils/util'

export interface Can {
  redo: boolean
  undo: boolean
  reset: boolean
  save: boolean
}

export interface State extends Array<Label> {}

interface Actions {
  set: (newStack: State[]) => void
  push: (newState: State) => void
  prev: () => void
  next: () => void
  reset: () => void
  deleteObject: (objectId: number) => void
  deleteCategory: (category: string) => void
}
export interface UseStateStackReturnProps extends Actions {
  nowState: State
  groupedState: [string, any][]
  can: Can
  currentIndex: number
}

export const useStateStack = (): UseStateStackReturnProps => {
  const stack = useRef<State[]>(resolveHookState([]))
  const [can, setCan] = useState<Can>({
    redo: false,
    undo: false,
    reset: false,
    save: false
  })
  const index = useRef<number>(0)
  const nowState = stack.current[index.current - 1] || []
  const update = useUpdate()

  useEffect(() => {
    setCan({
      redo: index.current < stack.current.length,
      undo: index.current > 1,
      reset: stack.current.length > 1,
      save: index.current > 1 || index.current < stack.current.length
    })
  }, [stack.current.length, index.current])

  const actions: Actions = useMemo(
    () => ({
      set: (newStack: State[]) => {
        stack.current = resolveHookState(newStack)
        index.current = stack.current[0].length ? stack.current.length : 0
        update()
      },

      push: (newState: State) => {
        const newStack = stack.current.slice(0, index.current)
        index.current = newStack.push(newState)
        actions.set(newStack)
      },

      prev: () => {
        index.current -= can.undo ? 1 : 0
        update()
      },

      next: () => {
        index.current += can.redo ? 1 : 0
        update()
      },

      reset: () => {
        if (can.reset)
          index.current = index.current !== 1 ? 1 : stack.current.length
        update()
      },

      deleteObject: (objectId: number) => {
        const newState = nowState.filter(({ id }) => id !== objectId)
        actions.push(newState)
      },

      deleteCategory: (category: string) => {
        const newState = nowState.filter(
          ({ categoryName }) => categoryName !== category
        )
        actions.push(newState)
      }
    }),
    [stack.current, index.current, can]
  )

  return {
    nowState,
    groupedState: nowState ? groupBy(nowState, 'categoryName') : [],
    can: can,
    currentIndex: index.current,
    ...actions
  }
}
