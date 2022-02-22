import { LabelType } from '../classes/Label'
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
    can,
    prev: prevState,
    next: nextState,
    reset,
    deleteObject
  } = stateStack
  const { undo: canUndo, redo: canRedo, reset: canReset } = can
  const { setDrawingType } = focus
  const { drawingType, objects } = focus.nowFocus

  const deleteObj = () => objects.forEach(({ id }) => deleteObject(id))

  const draw = (labelType: LabelType | null) => () =>
    setDrawingType(drawingType === labelType ? null : labelType)

  const drawPoint = draw(LabelType.Point)
  const drawLine = draw(LabelType.Line)
  const drawRect = draw(LabelType.Rect)

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
    if (event['path'][0] instanceof HTMLInputElement) return // prevent interfere keyboard input

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
      event.preventDefault() // prevent default event after execute such as save html
    } catch (error) {
      if (!(error instanceof TypeError)) console.log(error)
    }
  }

  window.onkeydown = keyboardEventRouter
}
