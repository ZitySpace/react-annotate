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

  const keyboardEventRouter = (event: KeyboardEvent) => {
    event.preventDefault() // prevent default event such as save html

    switch (event.code) {
      case 'Backspace':
      case 'Delete':
        objectId !== null && deleteObj()
        break
      case 'KeyZ':
        if ((event.ctrlKey || event.metaKey) && !event.shiftKey && canUndo)
          prevState()
        else if ((event.ctrlKey || event.metaKey) && event.shiftKey && canRedo)
          nextState()
        break
      case 'KeyR':
        if ((event.ctrlKey || event.metaKey) && canReset) reset()
        else if (!event.ctrlKey && !event.metaKey) drawRect()
        break
      case 'KeyO':
        drawPoint()
        break
      case 'KeyL':
        drawLine()
        break
      case 'Period':
      case 'ArrowRight':
        nextImage()
        break
      case 'Comma':
      case 'ArrowLeft':
        prevImage()
        break
      default:
        break
    }
  }

  window.onkeydown = keyboardEventRouter
}
