// import { fabric } from 'fabric'
import React, { useLayoutEffect, useRef, useState } from 'react'
import { useEffectOnce, useStateList } from 'react-use'
import { ButtonBar } from './components/ButtonBar'
import { useCanvas } from './hooks/useCanvas'
import { useContainer } from './hooks/useContainer'
import { useFocus } from './hooks/useFocus'
import { useMouse } from './hooks/useMouseEvents'
import { useStateStack } from './hooks/useStateStack'
import { Label } from './interface/basic'
import { RectLabel } from './label/RectLabel'
import {
  getAllCategoryNames,
  parseCategorysAndColors
} from './utils/categorys&colors'

export const NewImageAnnotater = ({
  imagesList,
  index = 0,
  isAnnotationsVisible = true,
  colors
}: {
  imagesList: any[]
  index?: number
  isAnnotationsVisible?: boolean
  colors?: string[]

  onSwitchVisible?: Function // TODO: bind to button
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

  const categoryNames = getAllCategoryNames(
    imagesList.map((image) => image.annotations)
  )
  const { categoryColors } = parseCategorysAndColors(
    categoryNames,
    colors || []
  )

  const [isAnnosVisible] = useState(isAnnotationsVisible)
  const categoryColorsRef = useRef(categoryColors)

  const {
    state: imageObj,
    setStateAt: setImageObjAt,
    next,
    prev
  } = useStateList<{ annotations: Label[] }>(imagesList)

  // Initialize the main variables
  const focus = useFocus()
  const {
    imageContainer,
    canvasRef,
    imageDims,
    canvasDims,
    boundary,
    offset,
    scale
  } = useContainer({ imageObj })
  const stateStack = useStateStack()
  const { loadListeners } = useCanvas({
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
  })
  // stateStack.bindCanvas(canvasRef)

  const mouseListeners = useMouse({
    canvasRef,
    imageDims,
    canvasDims,
    boundary,
    offset,
    scale
  })

  useEffectOnce(() => {
    if (index) setImageObjAt(index)
  })

  useLayoutEffect(() => {
    console.log('imageDims or canvasDims changed')

    canvasRef.current && loadListeners(mouseListeners) // mount event listeners
    // Initialize state stack
    stateStack.set([
      imageObj.annotations.map((anno) => anno.scaleTransform(scale, offset))
    ])
  }, [imageDims, canvasDims])

  return isAnnosVisible ? (
    <div className='w-full h-full flex flex-col justify-center items-center relative'>
      {imageContainer}
      <ButtonBar
        stateStack={stateStack}
        focus={focus}
        nextImg={next}
        prevImg={prev}
      />
    </div>
  ) : null
}
