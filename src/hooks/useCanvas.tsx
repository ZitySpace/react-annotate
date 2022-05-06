import { fabric } from 'fabric'
import { MutableRefObject, useEffect } from 'react'
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

  useEffect(() => {
    if (!canvas) return
    if (
      imageLoadingState === DataState.Ready &&
      annosInitState === DataState.Ready &&
      imageObj
    )
      canvas.setBackgroundImage(imageObj, canvas.renderAll.bind(canvas))
    else canvas.clear()
  }, [imageLoadingState, annosInitState, imageObj])
}
