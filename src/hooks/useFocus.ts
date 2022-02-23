import { useRef } from 'react'
import { useUpdate } from 'react-use'
import { Label, LabelType } from '../classes/Label'
import { Focus } from '../interfaces/basic'
import { mostRepeatedValue } from '../utils'

export interface UseFocusReturnProps {
  nowFocus: Focus
  setDrawingType(drawingType?: LabelType): void
  setObjects(objects?: Label[]): void
  canObjectShow(
    { type, id }: { type: string; id: number },
    showText?: boolean
  ): boolean
  isFocused({ id }: { id: number }): boolean
}

const initialFocus: Focus = {
  drawingType: LabelType.None,
  visibleType: Object.keys(LabelType).map((key) => LabelType[key]),
  category: null,
  objects: []
}

export const useFocus = () => {
  const focusRef = useRef<Focus>(initialFocus)
  const nowFocus = focusRef.current
  const update = useUpdate()
  console.log(nowFocus) // TODO: remove

  const methods = {
    setDrawingType: (drawingType: LabelType = LabelType.None) => {
      focusRef.current.drawingType = drawingType
      if (drawingType) focusRef.current.objects = []
      update()
    },

    setObjects: (objects: Label[] = []) => {
      focusRef.current.objects = objects
      focusRef.current.category =
        mostRepeatedValue(objects.map(({ categoryName }) => categoryName)) ||
        null
      update()
    },

    canObjectShow: (
      { type, id }: { type: string; id: number },
      showText: boolean = true
    ) =>
      (!nowFocus.objects.length && !nowFocus.drawingType) ||
      (nowFocus.objects.map(({ id }) => id).includes(id) &&
        (showText || type !== 'textbox')),

    isFocused: ({ id }: { id: number }) =>
      nowFocus.objects.map(({ id }) => id).includes(id)
  }
  return { nowFocus, ...methods }
}
