import { MutableRefObject, useEffect, useMemo, useRef } from 'react'
import { Dimension } from '../interface/basic'
import { Point } from '../label/PointLabel'
import { setLinePosition } from '../utils/util'
import { UseFocusReturnProps } from './useFocus'
import { State, UseStateStackReturnProps } from './useStateStack'
import { UseColorsReturnProps } from './useColor'
import { Label, newLabelFromFabricObj } from '../label/Label'

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
    focus.setObject(e.e ? e.target : undefined)
  }

  useEffect(() => {
    actions.syncStateToCanvas(nowState)
  }, [nowState, currentIndex])

  const actions = useMemo(
    () => ({
      syncCanvasToState: () => {
        console.log('syncCanvasToState called') // TODO: remove

        const isRect = ({ type, labelType }: any) =>
          type === 'rect' && labelType === 'Rect'
        const isPoint = ({ type, labelType }: any) =>
          type === 'circle' && labelType === 'Point'
        const isLine = ({ type, labelType }: any) =>
          type === 'line' && labelType === 'Line'

        const allCanvasObjects = canvas
          .getObjects()
          .filter((obj: any) => isRect(obj) || isLine(obj) || isPoint(obj))

        const nowState: Label[] = allCanvasObjects.map((obj) =>
          newLabelFromFabricObj({ obj, offset, scale })
        )

        pushState && pushState(nowState)
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
