import { UseFocusReturnProps } from './useFocus'
import { UseStateStackReturnProps } from './useStateStack'

export const useKeyboard = ({
  stateStack,
  focus,
  prev: prevImage,
  next: nextImage
}: {
  stateStack: UseStateStackReturnProps
  focus: UseFocusReturnProps
  prev: () => void
  next: () => void
}) => {
  const {
    nowState,
    can,
    prev: prevState,
    next: nextState,
    reset,
    push: pushState
  } = stateStack
  const { undo: canUndo, redo: canRedo, reset: canReset } = can
  const { setDrawing, setFocus } = focus
  const { isDrawing, objectId, categoryName } = focus.now

  const deleteObj = () => {
    if (objectId === null) return
    const newState = nowState.filter((anno) => anno.id !== objectId)
    pushState(newState)
  }

  const draw = (labelType: string | null) => () => {
    setDrawing(isDrawing === labelType ? null : labelType)
    setFocus({ categoryName })
  }
  const drawPoint = draw('Point')
  const drawLine = draw('Line')
  const drawRect = draw('Rect')

  const plainShortcutMap = {
    Backspace: deleteObj,
    Delete: deleteObj,
    KeyR: drawRect,
    KeyO: drawPoint,
    KeyL: drawLine,
    Period: nextImage,
    ArrowRight: nextImage,
    Comma: prevImage,
    ArrowLeft: prevImage
  }

  const keyboardEventRouter = (event: KeyboardEvent) => {
    event.preventDefault() // prevent default event such as save html
    const { code, ctrlKey, metaKey, shiftKey, altKey } = event
    const controlKey = ctrlKey || metaKey
    const auxiliaryKey = shiftKey || altKey

    const combinedShortcutMap = {
      KeyR: () => {
        if (!controlKey || auxiliaryKey) return
        else if (canReset) reset()
        else throw new Error('Cannot reset.')
      },
      KeyZ: () => {
        if (!controlKey || altKey) return

        if (!shiftKey && canUndo) prevState()
        else if (!shiftKey && !canUndo) throw new Error('Cannot undo.')
        else if (shiftKey && canRedo) nextState()
        else throw new Error('Cannot redo.')
      }
    }

    try {
      if (controlKey || auxiliaryKey) combinedShortcutMap[code]()
      else plainShortcutMap[code]()
    } catch (error) {
      if (!(error instanceof TypeError)) console.log(error)
    }
  }

  window.onkeydown = keyboardEventRouter
}
