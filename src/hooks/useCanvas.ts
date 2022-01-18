import { MutableRefObject, useEffect, useMemo, useRef } from 'react'
import { Dimension } from '../interface/basic'
import { Point } from '../label/PointLabel'
import { setLinePosition } from '../utils/util'
import { UseFocusReturnProps } from './useFocus'
import { State, UseStateStackReturnProps } from './useStateStack'
import { UseColorsReturnProps } from './useColor'
import { isLabel, Label, newLabelFromFabricObj } from '../label/Label'

export const useCanvas = ({
  canvasRef,
  focus,
  isAnnosVisible,
  annoColors,
  imageDims,
  canvasDims,
  boundary,
  offset,
  scale,
  stateStack
}: {
  canvasRef: MutableRefObject<fabric.Canvas | null>
  focus: UseFocusReturnProps
  isAnnosVisible: boolean
  annoColors: UseColorsReturnProps
  imageDims: Dimension
  canvasDims: Dimension
  boundary: { x: number[]; y: number[] } | null
  offset: Point
  scale: number
  stateStack: UseStateStackReturnProps
}) => {
  const canvas = canvasRef.current!
  const listenersRef = useRef<object>({})
  const listeners = listenersRef.current

  let nothing: any = {
    imageDims,
    canvasDims,
    boundary
  }
  nothing = !nothing

  const renderLock = useRef<boolean>(false)
  const setRenderLock = () => {
    renderLock.current = true
  }
  const getRenderLock = () => {
    const nowLock = renderLock.current
    renderLock.current = false // if it was queried, unlock
    return nowLock
  }

  const { nowState, currentIndex, push: pushState } = stateStack
  const setFocus = (e: fabric.IEvent<Event>) => {
    focus.setObject((e as any).selected ? e.target : undefined)
  }
  const canvasLabelsCount =
    canvas && canvas.getObjects ? canvas.getObjects().filter(isLabel).length : 0

  useEffect(() => {
    actions.syncStateToCanvas(nowState)
  }, [nowState, currentIndex])

  useEffect(() => {
    canvasLabelsCount !== nowState.length && actions.syncCanvasToState()
  }, [canvasLabelsCount])

  const actions = useMemo(
    () => ({
      syncCanvasToState: () => {
        console.log('syncCanvasToCanvas called') // TODO: remove

        const allCanvasObjects = canvas.getObjects().filter(isLabel)
        const newState: Label[] = allCanvasObjects.map((obj) =>
          newLabelFromFabricObj({ obj, offset, scale })
        )

        pushState && pushState(newState)
        setRenderLock()
      },

      syncStateToCanvas: (nowState: State, forceVisable: boolean = false) => {
        if (!canvas || getRenderLock()) return
        console.log('syncStateToCanvas called') // TODO: remove

        canvas.remove(...canvas.getObjects())
        nowState.forEach((anno: Label) => {
          const { categoryName } = anno
          const currentColor = annoColors.get(categoryName!)
          const visible = forceVisable || isAnnosVisible // && isFocused(categoryName, id))
          const fabricObjects = anno.getFabricObjects({ currentColor })
          canvas.add(
            ...Object.values(fabricObjects).map((obj: any) =>
              obj.set({ visible })
            )
          )
        })
        canvas.renderAll()
      },

      loadListeners: (newListeners: object) => {
        if (!canvas) return
        // save new listeners
        Object.assign(listeners, newListeners)

        canvas.off() // remove all existed listeners
        Object.entries(listeners).forEach(([event, handler]) => {
          canvas.on(event, handler)
        })
      }
    }),
    [canvas]
  )

  // set default listeners and must after declare actions otherwise it will not work
  Object.assign(listeners, {
    'object:moving': (e: fabric.IEvent<Event>) => {
      setLinePosition(e.target as any)
    },
    'object:modified': actions.syncCanvasToState, // TODO: update textbox and more
    'selection:updated': setFocus,
    'selection:created': setFocus,
    'selection:cleared': setFocus
  })

  // If canvas no null, mount listeners
  canvas && actions.loadListeners(listeners)

  return { ...actions }
}
