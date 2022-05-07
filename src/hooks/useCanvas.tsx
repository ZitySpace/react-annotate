import { fabric } from 'fabric'
import { MutableRefObject, useEffect, useMemo, useRef } from 'react'
import { DataState } from '../interfaces/basic'

export const useCanvas = ({
  canvasRef,
  imageObj,
  imageLoadingState,
  annosInitState
}: {
  canvasRef: MutableRefObject<fabric.Canvas | null>
  imageObj: fabric.Image | null
  imageLoadingState: DataState
  annosInitState: DataState
}) => {
  const canvas = canvasRef.current
  const listenersRef = useRef<object>({})
  const listeners = listenersRef.current

  useEffect(() => {
    if (!canvas) return
    if (
      imageLoadingState === DataState.Ready &&
      annosInitState === DataState.Ready &&
      imageObj
    )
      canvas
        .setBackgroundImage(imageObj, canvas.renderAll.bind(canvas))
        .setViewportTransform([1, 0, 0, 1, 0, 0])
    else canvas.clear()
  }, [imageLoadingState, annosInitState, imageObj])

  const methods = useMemo(
    () => ({
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
