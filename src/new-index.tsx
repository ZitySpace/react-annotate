import { fabric } from 'fabric'
import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { useEffectOnce, useStateList } from 'react-use'
import { useContainer } from './hooks/useContainer'
import { useStateStack } from './hooks/useStateStack'
import { Label } from './interface/basic'
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
  } = useStateList<{ annotations: Label[] }>(imagesList)

  const stateStack = useStateStack()

  useEffectOnce(() => {
    if (index) setImageObjAt(index)
    console.log(imageDims, canvasDims, boundary, offset, scale)
    // setTimeout(nextImageObj, 3000)
  })

  const canvasRef = useRef<fabric.Canvas | null>(null)
  const { imageContainer, imageDims, canvasDims, boundary, offset, scale } =
    useContainer({
      imageObj,
      canvasRef
    })

  useLayoutEffect(() => {
    // console.log(imageDims, canvasDims, boundary, offset, scale)
    stateStack.pushState(imageObj.annotations)
  }, [imageDims, canvasDims])

  useEffect(() => {
    console.log(stateStack.state)
  }, [stateStack.state])

  return isAnnotationsVisible ? (
    <div className='w-full h-full flex flex-col justify-center items-center relative'>
      {imageContainer}
    </div>
  ) : null
}
