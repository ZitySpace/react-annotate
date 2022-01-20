// import { fabric } from 'fabric'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { useEffectOnce, useStateList } from 'react-use'
import { ButtonBar } from './components/ButtonBar'
import { CategoryPanel } from './components/CategoryPanel'
import { useCanvas } from './hooks/useCanvas'
import { useColors } from './hooks/useColor'
import { useContainer } from './hooks/useContainer'
import { useFocus } from './hooks/useFocus'
import { useMouseListeners } from './hooks/useMouseListeners'
import { useStateStack } from './hooks/useStateStack'
import { Label } from './label/Label'
import { RectLabel } from './label/RectLabel'

export const NewImageAnnotater = ({
  imagesList,
  index = 0,
  isAnnotationsVisible = true,
  categoryColors,
  categoryNames,
  colors
}: {
  imagesList: any[]
  index?: number
  isAnnotationsVisible?: boolean
  categoryColors?: Map<string, string>
  categoryNames?: string[]
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

  if (!(categoryColors || categoryNames || colors))
    throw new Error(
      'Params categoryColors can not be empty if categoryNames and colors not exists.'
    )

  const annoColors = useColors({ categoryColors, categoryNames, colors })
  const [isAnnosVisible] = useState(isAnnotationsVisible)

  const {
    state: imageObj,
    setStateAt: setImageObjAt,
    next,
    prev
  } = useStateList<{ annotations: Label[] }>(imagesList)

  // Initialize the main variables
  const focus = useFocus()
  const stateStack = useStateStack()

  const {
    ImageContainer,
    canvasRef,
    imageDims,
    canvasDims,
    boundary,
    offset,
    scale
  } = useContainer({ imageObj })

  const { loadListeners } = useCanvas({
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
  })

  const mouseListeners = useMouseListeners({
    canvasRef,
    stateStack,
    focus,
    annoColors,
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
    // Initialize state stack
    const imageAnnos = imageObj.annotations.map((anno) =>
      anno.scaleTransform(scale, offset)
    )
    stateStack.set([imageAnnos])
  }, [imageDims, canvasDims])

  useEffect(() => {
    canvasRef.current && loadListeners(mouseListeners) // mount event listeners
  }, [mouseListeners])

  return isAnnosVisible ? (
    <div className='w-full h-full flex flex-col justify-center items-center relative'>
      {ImageContainer}
      <CategoryPanel
        groupedState={stateStack.grouped()}
        focus={focus}
        annoColors={annoColors}
      />
      <ButtonBar
        stateStack={stateStack}
        focus={focus}
        nextImg={next}
        prevImg={prev}
      />
    </div>
  ) : null
}
