import { useEffect, useMemo, useRef, useState } from 'react'
import { useUpdate } from 'react-use'
import { resolveHookState } from 'react-use/lib/misc/hookState'
import { Label } from '../classes/Label'
import { groupBy } from '../utils/util'

export interface Can {
  redo: boolean
  undo: boolean
  reset: boolean
  save: boolean
}

export interface State extends Array<Label> {}

interface Actions {
  set: (newStack: State[]) => boolean
  push: (newState: State) => boolean
  prev: () => boolean
  next: () => boolean
  reset: () => boolean
  deleteObject: (objectId: number) => boolean
  deleteCategory: (category: string) => boolean
  renameCategory: (oldName: string, newName: string) => void
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
        return true
      },

      push: (newState: State) => {
        const newStack = stack.current.slice(0, index.current)
        index.current = newStack.push(newState)
        return actions.set(newStack)
      },

      prev: () => {
        index.current -= can.undo ? 1 : 0
        update()
        return true
      },

      next: () => {
        index.current += can.redo ? 1 : 0
        update()
        return true
      },

      reset: () => {
        if (can.reset)
          index.current = index.current !== 1 ? 1 : stack.current.length
        update()
        return true
      },

      deleteObject: (objectId: number) => {
        if (!nowState.map(({ id }) => id).includes(objectId)) return false
        const newState = nowState.filter(({ id }) => id !== objectId)
        return actions.push(newState)
      },

      deleteCategory: (category: string) => {
        if (
          !nowState.map(({ categoryName }) => categoryName).includes(category)
        )
          return false
        const newState = nowState.filter(
          ({ categoryName }) => categoryName !== category
        )
        return actions.push(newState)
      },

      renameCategory(oldCategory: string, newCategory: string) {
        nowState.forEach((label) => {
          label.categoryName =
            label.categoryName === oldCategory
              ? newCategory
              : label.categoryName
        })
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
