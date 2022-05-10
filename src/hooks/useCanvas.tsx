import { fabric } from 'fabric'
import { useEffect, useMemo, useRef } from 'react'
import { Label } from '../classes/Label'
import { DataState } from '../interfaces/basic'
import { isLabel, newLabel } from '../utils/label'
import { UseColorsReturnProps } from './useColor'
import { GeometricAttributes } from './useData'
import { UseFocusReturnProps } from './useFocus'
import { State, UseStateStackReturnProps } from './useStateStack'

export const useCanvas = ({
  canvas,
  imageObj,
  imageLoadingState,
  annosInitState,
  stateStack,
  geometricAttributes,
  annoColors,
  focus,
  isAnnosVisible
}: {
  canvas: fabric.Canvas | null
  imageObj: fabric.Image | null
  imageLoadingState: DataState
  annosInitState: DataState
  stateStack: UseStateStackReturnProps
  geometricAttributes: GeometricAttributes
  annoColors: UseColorsReturnProps
  focus: UseFocusReturnProps
  isAnnosVisible: boolean
}) => {
  const listenersRef = useRef<object>({})
  const listeners = listenersRef.current

  const isDataReady =
    imageLoadingState === DataState.Ready && annosInitState === DataState.Ready
  const { nowState, push: pushState } = stateStack
  const { scale, offset } = geometricAttributes
  const { isFocused, setObjects } = focus

  // render lock used to avoid whole cycle callback caused by canvas changed which will ruin the canvas
  const renderLock = useRef<boolean>(false)
  const setRenderLock = () => {
    renderLock.current = true
  }
  const getRenderLock = () => {
    const nowLock = renderLock.current
    renderLock.current = false // if it was queried, unlock
    return nowLock
  }

  // Sync state to canvas & focus if state changed
  useEffect(() => {
    if (!isDataReady) return
    methods.syncStateToCanvas(nowState) // sync state
    setObjects(nowState.filter(isFocused)) // sync focus
  }, [JSON.stringify(nowState), isDataReady]) // Deep compare

  // Initialize background image
  useEffect(() => {
    if (!canvas) return
    if (isDataReady && imageObj)
      canvas
        .setBackgroundImage(imageObj, () => {})
        .setViewportTransform([1, 0, 0, 1, 0, 0])
    else canvas.clear()
  }, [isDataReady, imageObj])

  const methods = useMemo(
    () => ({
      syncCanvasToState: () => {
        console.log('syncCanvasToState called') // TODO: remove

        const allCanvasObjects = canvas!.getObjects().filter(isLabel)
        const newState: Label[] = allCanvasObjects.map((obj) =>
          newLabel({ obj, offset, scale })
        )
        pushState && pushState(newState)
        setRenderLock() // avoid useEffect hook invoke syncStateToCanvas method
      },

      syncStateToCanvas: (nowState: State, forceVisable: boolean = false) => {
        if (!canvas || getRenderLock()) return

        canvas.remove(...canvas.getObjects())
        nowState.forEach((anno: Label) => {
          const { category } = anno
          const currentColor = annoColors.get(category!)
          // TODO: ensure visible
          const visible = forceVisable || isAnnosVisible // && isFocused(categoryName, id))
          const fabricObjects = anno.getFabricObjects(currentColor, visible)
          canvas.add(...fabricObjects)
        })
        canvas.requestRenderAll()
      },

      /**
       * Load event listeners to canvas.
       * @param newListeners listeners object which want to load
       */
      loadListeners: (newListeners: object) => {
        if (!canvas) return
        Object.assign(listeners, newListeners) // save new listeners and replace old listeners
        canvas.off() // remove all existed listeners
        Object.entries(listeners).forEach(([event, handler]) => {
          canvas.on(event, handler)
        })
      }
    }),
    [canvas]
  )

  return { loadListeners: methods.loadListeners }
}
