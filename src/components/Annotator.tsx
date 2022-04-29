import React, { useEffect, useLayoutEffect, useState } from 'react'
import { useCanvas } from '../hooks/useCanvas'
import { useColors } from '../hooks/useColor'
import { useContainer } from '../hooks/useContainer'
import { useData } from '../hooks/useData'
import { useFocus } from '../hooks/useFocus'
import { useKeyboard } from '../hooks/useKeyboard'
import { useMouseHover } from '../hooks/useMouseHover'
import { useMouseListeners } from '../hooks/useMouseListeners'
import { useStateStack } from '../hooks/useStateStack'
import { ImageObject } from '../interfaces/basic'
import '../tailwind.css'
import { ButtonBar } from './ButtonBar'
import { OperationPanel } from './OperationPanel'

export const Annotator = ({
  imagesList,
  index = 0,
  isAnnotationsVisible = true,
  categoryColors,
  categories,
  colors
}: {
  imagesList: ImageObject[]
  index?: number
  isAnnotationsVisible?: boolean
  categoryColors?: Map<string, string>
  categories?: string[]
  colors?: string[]
  onSwitchVisible?: Function // TODO: bind to button
}) => {
  const [isAnnosVisible] = useState(isAnnotationsVisible) // TODO: remove this global state or add setter and bind to button

  // Initialize the main variables
  const focus = useFocus() // variables shared between canvas and category panel to show user interest in the other one.
  const stateStack = useStateStack() // handle canvas's state history stack and the buttons bar limits.
  const { imageObj, prevImg, nextImg, save } = useData(
    imagesList,
    stateStack,
    index
  )
  const annoColors = useColors() // handle colors' stuff.

  const { ImageContainer, canvasRef, canvasProps } = useContainer({ imageObj }) // get tsx fragment and some variable which calculate after image loaded.

  const { loadListeners } = useCanvas({
    canvasRef,
    canvasProps,
    focus,
    isAnnosVisible,
    annoColors,
    stateStack
  }) // canvas host canvas' status and responsible for synchronize canvas & focus & stateStack.

  const mouseListeners = {
    ...useMouseListeners({
      canvasRef,
      canvasProps,
      stateStack,
      focus,
      annoColors
    }), // hanlde mouse & touch board operations logic, includes draw, panning and zoom
    ...useMouseHover({ focus }) // handle hover effect of the points and polygon's lines
  }

  useKeyboard({ stateStack, focus, nextImg, prevImg, save }) // listeners for keyboard for support shortcuts.

  useLayoutEffect(() => {
    console.log('imageDims or canvasDims changed')
    // Initialize state stack
    const imageAnnos = imageObj.annotations.map((anno) =>
      anno.scaleTransform(canvasProps.scale, canvasProps.offset)
    )
    annoColors.init({ categoryColors, categories, colors }) // initialize colors
    stateStack.set([imageAnnos])
  }, [canvasProps.imageDims, canvasProps.canvasDims])

  // remount mouse listeners when it changed.
  useEffect(() => {
    canvasRef.current && loadListeners(mouseListeners) // mount event listeners
  }, [mouseListeners])

  return isAnnosVisible ? (
    <div className='w-full h-full flex flex-col justify-center items-center relative'>
      {/* canvas and loaded image */}
      {ImageContainer}
      <OperationPanel
        stateStack={stateStack}
        focus={focus}
        annoColors={annoColors}
      />
      <ButtonBar
        stateStack={stateStack}
        focus={focus}
        nextImg={nextImg}
        prevImg={prevImg}
        save={save}
      />
    </div>
  ) : null
}
