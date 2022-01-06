import { fabric } from 'fabric'
import React, { useLayoutEffect, useRef } from 'react'
import { useEffectOnce, useStateList } from 'react-use'
import { UseContainer } from './hooks/useContainer'
import { RectLabel } from './label/RectLabel'

export const NewImageAnnotater = ({
  imagesList,
  index = 0,
  isAnnotationsVisible = true
}: {
  imagesList: any[]
  index?: number
  isAnnotationsVisible?: boolean
}) => {
  // Handle inputs with old shape
  // TODO: remove
  imagesList = imagesList.map((img) => {
    return {
      ...img,
      annotations: img.annotations.map((anno: any, id: number) => {
        const { x, y, w, h, category } = anno
        return new RectLabel({ x, y, w, h, id, categoryName: category })
      })
    }
  })

  const {
    state: imageObj,
    // prev: prevImageObj,
    // next: nextImageObj,
    setStateAt: setImageObjAt
    // currentIndex: imageIndex
  } = useStateList(imagesList)

  useEffectOnce(() => {
    if (index) setImageObjAt(index)
  })

  const canvasRef = useRef<fabric.Canvas | null>(null)
  const { imageContainer, imageDims, canvasDims, boundary, offset } =
    UseContainer({
      imageObj,
      canvasRef
    })

  useLayoutEffect(() => {
    console.log(imageDims, canvasDims, boundary, offset)
    const canvasElm = document.getElementsByTagName('canvas')[0]
    const canvas = new fabric.Canvas(canvasElm)
    console.log(canvas)
  }, [imageDims, canvasDims])

  return isAnnotationsVisible ? (
    <div className='w-full h-full flex flex-col justify-center items-center relative'>
      {imageContainer}
      {/* <div
        className='h-full relative pb-7 md:pb-9 select-none w-full flex justify-center items-center overflow-y-hidden'
        id='canvas_extended'
      >
        {ImageContaioner}
        <canvas ref={canvasElRef} className='hidden' />
      </div> */}
    </div>
  ) : null
}
