import { MutableRefObject, useEffect, useMemo, useRef } from 'react'
import { useUpdate } from 'react-use'
import { resolveHookState } from 'react-use/lib/misc/hookState'
import { Label } from '../interface/basic'
import { groupBy } from '../utils/categorys&colors'

export interface Can {
  redo: boolean
  undo: boolean
  reset: boolean
  save: boolean
}

export interface State extends Array<Label> {}

export interface UseStateStackReturnProps {
  can: Can
  currentIndex: number
  nowState: State
  set: (newStack: State[]) => void
  push: (newState: State) => void
  prev: () => void
  next: () => void
  reset: () => void
  grouped: () => any
  bindCanvas: (canvasRef: MutableRefObject<fabric.Canvas | null>) => void
  syncStateToCanvas: (state: State, forceVisable: boolean) => void
}

export const useStateStack = ({
  categoryColorsRef,
  isAnnosVisible,
  initialState = []
}: {
  categoryColorsRef: MutableRefObject<any>
  isAnnosVisible: boolean
  initialState?: State
}): UseStateStackReturnProps => {
  const stack = useRef<State[]>(resolveHookState([initialState] || []))
  const can = useRef<Can>({
    redo: false,
    undo: false,
    reset: false,
    save: false
  })
  const index = useRef<number>(0)
  const canvasR = useRef<fabric.Canvas | null>(null)
  const canvas = canvasR.current
  const colors = categoryColorsRef.current

  const update = useUpdate()

  useEffect(() => {
    can.current = {
      redo: index.current < stack.current.length,
      undo: index.current > 1,
      reset: stack.current.length > 1,
      save: index.current > 1 || index.current < stack.current.length
    }
    actions.syncStateToCanvas(actions.nowState)
    update()
  }, [stack.current.length, index.current])

  const actions = useMemo(
    () => ({
      nowState: stack.current[index.current - 1] || [],

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
        index.current -= can.current.undo ? 1 : 0
        update()
      },

      next: () => {
        index.current += can.current.redo ? 1 : 0
        update()
      },

      reset: () => {
        if (can.current.reset)
          index.current = index.current !== 1 ? 1 : stack.current.length
        update()
      },

      grouped: () =>
        actions.nowState ? groupBy(actions.nowState, 'categoryName') : {},

      bindCanvas: (canvasRef: MutableRefObject<fabric.Canvas | null>) => {
        canvasR.current = canvasRef.current ? canvasRef.current : null
      },

      syncStateToCanvas: (state: State, forceVisable: boolean = false) => {
        if (!canvas) return
        console.log('syncStateToCanvas called') // TODO: remove

        canvas.remove(
          ...canvas.getObjects().filter((obj) => obj.type !== 'image')
        )

        state.forEach((anno: Label) => {
          const { categoryName } = anno
          const currentColor = colors[categoryName!]
          const visible = forceVisable || isAnnosVisible // && isFocused(categoryName, id))
          const fabricObjects = anno.getFabricObjects({ currentColor })
          canvas.add(
            ...Object.values(fabricObjects).map((obj: any) =>
              obj.set({ visible })
            )
          )
        })
        // canvas.renderAll()
      }
    }),
    [stack.current, index.current, can.current]
  )

  return {
    can: can.current,
    currentIndex: index.current,
    ...actions
  }
}
