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

  const { Container, canvas, canvasDims, initWidthRef } = useContainer()

  const data = useData(imagesList, stateStack, canvasDims, initWidthRef, index)

  const { loadListeners } = useCanvas({
    canvas,
    data,
    stateStack,
    annoColors,
    focus,
    isAnnosVisible
  })

  useMouse({
    canvas,
    geometricAttributes: data.geometricAttributes,
    focus,
    stateStack,
    annoColors,
    loadListeners,
    initWidthRef
  })
  useKeyboard({ stateStack, focus, dataOperation: data.operation }) // listeners for keyboard for support shortcuts.

  const nothing = {
    categoryColors,
    categories,
    colors
  }
  !nothing

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
        dataOperation={data.operation}
      />
    </div>
  ) : null
}
