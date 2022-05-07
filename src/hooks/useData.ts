import { fabric } from 'fabric'
import { useEffect, useRef, useState } from 'react'
import { useStateList } from 'react-use'
import { Boundary } from '../classes/Geometry/Boundary'
import { Dimension } from '../classes/Geometry/Dimension'
import { Point } from '../classes/Geometry/Point'
import { Label } from '../classes/Label'
import { ImageData, DataState } from '../interfaces/basic'
import { UseStateStackReturnProps } from './useStateStack'

export interface GeometryAttributes {
  // canvasDims: Dimension
  imageDims: Dimension
  imageBoundary: Boundary
  scale: number
  offset: Point
}

export interface UseDataReturnProps {
  imageObj: fabric.Image | null
  imageLoadingState: DataState
  annosInitState: DataState
  geometryAttributes: GeometryAttributes
  prevImg: () => void
  nextImg: () => void
  save: () => Label[]
}

export const useData = (
  imagesList: ImageData[],
  stateStack: UseStateStackReturnProps,
  canvasDims: Dimension | null,
  initIndex: number = 0
) => {
  // initialize images list
  const {
    state: imageData,
    setStateAt: setImageIdx,
    prev,
    next
  } = useStateList<ImageData>(imagesList) // refer: https://github.com/streamich/react-use/blob/master/docs/useStateList.md

  const { nowState } = stateStack

  const imageDims = useRef<Dimension>(new Dimension())
  const imageBoundary = useRef<Boundary>(new Boundary())
  const scale = useRef<number>(1)
  const offset = useRef<Point>(new Point())

  const [annosInitState, setAnnosInitState] = useState<DataState>(
    DataState.Loading
  )
  const [imageLoadingState, setImageLoadingState] = useState<DataState>(
    DataState.Loading
  )
  const imageObj = useRef<fabric.Image | null>(null)

  const methods = {
    save: () => {
      console.log('save called')
      return nowState
    },

    prevImg: () => (prev() as undefined) || methods.save(),
    nextImg: () => (next() as undefined) || methods.save()
  }

  useEffect(() => {
    if (!canvasDims) return
    setImageLoadingState(DataState.Loading)
    setAnnosInitState(DataState.Loading)

    // calculate the image dimensions and boundary, its scale and the offset between canvas and image
    const { width: image_w, height: image_h } = imageData
    const { w: canvas_w, h: canvas_h } = canvasDims
    const scale_x = image_w < canvas_w ? 1 : canvas_w / image_w
    const scale_y = image_h < canvas_h ? 1 : canvas_h / image_h
    scale.current = Math.min(scale_x, scale_y)
    imageDims.current = new Dimension(image_w, image_h).zoom(scale.current)
    imageBoundary.current = imageDims.current.boundaryIn(canvasDims)
    offset.current = imageDims.current.offsetTo(canvasDims)

    const { x: left, y: top } = offset.current
    const [scaleX, scaleY] = [scale.current, scale.current]
    fabric.Image.fromURL(
      imageData.url,
      (img: fabric.Image) => {
        const { width, height } = img
        if (width && height) {
          imageObj.current = img
          setImageLoadingState(DataState.Ready)
        } else setImageLoadingState(DataState.Error)
      },
      { left, top, scaleX, scaleY }
    )

    const annos = imageData.annotations
    annos.forEach((anno) => anno.scaleTransform(scale.current, offset.current))
    stateStack.set([annos])
    setAnnosInitState(DataState.Ready)
  }, [imageData, canvasDims])

  useEffect(() => {
    initIndex && setImageIdx(initIndex)
  }, [])

  return {
    imageObj: imageObj.current,
    imageLoadingState,
    annosInitState,
    geometryAttributes: {
      imageDims: imageDims.current,
      imageBoundary: imageBoundary.current,
      scale: scale.current,
      offset: offset.current
    },
    ...methods
  }
}
