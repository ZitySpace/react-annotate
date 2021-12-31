/* eslint-disable no-unused-vars */
import { useRef } from 'react'
import { Label } from '../interface/basic'
import { groupBy } from '../utils/categorys&colors'

interface Can {
  redo: boolean
  undo: boolean
  reset: boolean
  save: boolean
}

export function createStateStack(initialState?: Function | Label[]) {
  const stateStack = useRef<Label[][]>([])
  const index = useRef<number>(0)
  const can = useRef<Can>({
    redo: false,
    undo: false,
    reset: false,
    save: false
  })

  const updateCan = () => {
    can.current = {
      redo: index.current < stateStack.current.length,
      undo: index.current > 1,
      reset: stateStack.current.length > 1,
      save: index.current > 1 || index.current < stateStack.current.length
    }
  }

  const nowState = () => {
    updateCan()
    return stateStack.current[index.current]
  }

  const pushState = (newState: Label[]) => {
    index.current = stateStack.current.slice(0, index.current).push(newState)
    return nowState()
  }

  const nextState = () => {
    index.current -= can.current.redo ? 1 : 0
    return nowState()
  }

  const prevState = () => {
    index.current += can.current.undo ? 1 : 0
    return nowState()
  }

  const resetState = () => {
    if (can.current.reset)
      index.current = index.current !== 1 ? 1 : stateStack.current.length
    return nowState()
  }

  const groupedState = () => {
    if (nowState()) return groupBy(nowState(), 'categoryName')
    else return {}
  }

  const state = initialState instanceof Function ? initialState() : initialState
  if (state) pushState(state)

  return {
    stateStack: stateStack.current,
    index: index.current,
    can: can.current,
    nowState,
    pushState,
    nextState,
    prevState,
    resetState,
    groupedState
  }
}
