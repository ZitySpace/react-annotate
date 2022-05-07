import React, { useState } from 'react'
import { useCanvas } from '../hooks/useCanvas'
import { useColors } from '../hooks/useColor'
import { useContainer } from '../hooks/useContainer'
import { useData } from '../hooks/useData'
import { useFocus } from '../hooks/useFocus'
import { useKeyboard } from '../hooks/useKeyboard'
import { useMouse } from '../hooks/useMouse'
import { useStateStack } from '../hooks/useStateStack'
import { ImageData } from '../interfaces/basic'
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
  imagesList: ImageData[]
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
  const annoColors = useColors() // handle colors' stuff.

  const { Container, canvas, canvasDims } = useContainer()
  const {
    imageObj,
    imageLoadingState,
    annosInitState,
    prevImg,
    nextImg,
    save
  } = useData(imagesList, stateStack, canvasDims, index)
  const { loadListeners } = useCanvas({
    canvas,
    imageObj,
    imageLoadingState,
    annosInitState
  })
  useMouse({ canvas, canvasDims, focus, loadListeners })
  useKeyboard({ stateStack, focus, nextImg, prevImg, save }) // listeners for keyboard for support shortcuts.

  // const { ImageContainer, canvasRef, canvasProps } = useContainer({ imageData }) // get tsx fragment and some variable which calculate after image loaded.

  const nothing = {
    categoryColors,
    categories,
    colors
  }
  !nothing

  // const { loadListeners } = useCanvas({
  //   canvasRef,
  //   canvasProps,
  //   focus,
  //   isAnnosVisible,
  //   annoColors,
  //   stateStack
  // }) // canvas host canvas' status and responsible for synchronize canvas & focus & stateStack.

  return isAnnosVisible ? (
    <div className='w-full h-full flex flex-col justify-center items-center relative'>
      {Container}
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
