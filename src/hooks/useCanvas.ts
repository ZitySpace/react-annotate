import { MutableRefObject, useEffect, useMemo, useRef } from 'react'
import { Dimension, Label } from '../interface/basic'
import { Point } from '../label/PointLabel'
import { LineLabel } from '../label/LineLabel'
import { PointLabel } from '../label/PointLabel'
import { RectLabel } from '../label/RectLabel'
import { setLinePosition } from '../utils/util'
import { UseFocusReturnProps } from './useFocus'
import { State, UseStateStackReturnProps } from './useStateStack'

export const useCanvas = ({
  canvasRef,
  focus,
  isAnnosVisible,
  categoryColorsRef,
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
  categoryColorsRef: MutableRefObject<any>
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
  const colors = categoryColorsRef.current
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
    focus.setObject(e.e ? e.target : undefined)
  }

  useEffect(() => {
    actions.syncStateToCanvas(nowState)
  }, [nowState, currentIndex])

  const actions = useMemo(
    () => ({
      syncCanvasToState: () => {
        console.log('syncCanvasToState called') // TODO: remove

        const allCanvasObjects = canvas.getObjects()
        const Rects = allCanvasObjects.filter(
          (obj: any) => obj.type === 'rect' && obj.labelType === 'Rect'
        )
        const Points = allCanvasObjects.filter(
          (obj: any) => obj.type === 'circle' && obj.labelType === 'Point'
        )
        const Lines = allCanvasObjects.filter(
          (obj: any) => obj.type === 'line' && obj.labelType === 'Line'
        )

        const nowState: Label[] = [
          ...Rects.map((obj: fabric.Rect) =>
            RectLabel.fromFabricRect({ obj, offset, scale })
          ),
          ...Points.map((obj: fabric.Circle) =>
            PointLabel.fromFabricPoint({ obj, offset, scale })
          ),
          ...Lines.map((obj: fabric.Line) =>
            LineLabel.fromFabricLine({ obj, offset, scale })
          )
        ]

        pushState && pushState(nowState)
        setRenderLock()
      },

      syncStateToCanvas: (nowState: State, forceVisable: boolean = false) => {
        if (!canvas || getRenderLock()) return
        console.log('syncStateToCanvas called') // TODO: remove

        canvas.remove(...canvas.getObjects())
        nowState.forEach((anno: Label) => {
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
        canvas.renderAll()
      },

      loadListeners: (newListeners: object) => {
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
