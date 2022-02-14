import React, { useEffect, useLayoutEffect, useState } from 'react'
import { useEffectOnce, useStateList } from 'react-use'
import { Label } from '../classes/Label'
import { RectLabel } from '../classes/Label/RectLabel'
import { ButtonBar } from '../components/ButtonBar'
import { CategoryPanel } from '../components/CategoryPanel'
import { useCanvas } from '../hooks/useCanvas'
import { useColors } from '../hooks/useColor'
import { useContainer } from '../hooks/useContainer'
import { useFocus } from '../hooks/useFocus'
import { useKeyboard } from '../hooks/useKeyboard'
import { useMouseListeners } from '../hooks/useMouseListeners'
import { useStateStack } from '../hooks/useStateStack'
import '../tailwind.css'

export const Annotater = ({
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

  const [isAnnosVisible] = useState(isAnnotationsVisible) // TODO: remove this global state or add setter and bind to button

  const {
    state: imageObj,
    setStateAt: setImageObjAt,
    next,
    prev
  } = useStateList<{ annotations: Label[] }>(imagesList) // refer: https://github.com/streamich/react-use/blob/master/docs/useStateList.md

  // Initialize the main variables
  const focus = useFocus() // variables shared between canvas and category panel to show user interest in the other one.
  const stateStack = useStateStack() // handle canvas's state history stack and the buttons bar limits.
  const annoColors = useColors({ categoryColors, categoryNames, colors }) // handle colors' stuff.

  const {
    ImageContainer,
    canvasRef,
    imageDims,
    canvasDims,
    boundary,
    offset,
    scale
  } = useContainer({ imageObj }) // get tsx fragment and some variable which calculate after image loaded.

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
  }) // canvas host canvas' status and responsible for synchronize canvas & focus & stateStack.

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
  }) // hanlde mouse & touch board operations logic.

  useKeyboard({ stateStack, focus, next, prev }) // listeners for keyboard for support shortcuts.

  // re-render to set loading index images
  useEffectOnce(() => {
    index && setImageObjAt(index)
  })

  useLayoutEffect(() => {
    console.log('imageDims or canvasDims changed')
    // Initialize state stack
    const imageAnnos = imageObj.annotations.map((anno) =>
      anno.scaleTransform(scale, offset)
    )
    stateStack.set([imageAnnos])
  }, [imageDims, canvasDims])

  // remount mouse listeners when it changed.
  useEffect(() => {
    canvasRef.current && loadListeners(mouseListeners) // mount event listeners
  }, [mouseListeners])

  return isAnnosVisible ? (
    <div className='w-full h-full flex flex-col justify-center items-center relative'>
      {ImageContainer}
      <CategoryPanel
        stateStack={stateStack}
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
