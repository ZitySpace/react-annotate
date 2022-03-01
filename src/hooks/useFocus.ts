import { useRef } from 'react'
import { useUpdate } from 'react-use'
import { Label, LabelType } from '../classes/Label'
import { Focus } from '../interfaces/basic'
import { mostRepeatedValue } from '../utils'

export interface UseFocusReturnProps {
  nowFocus: Focus
  setDrawingType: (drawingType?: LabelType) => void
  setObjects: (objects?: Label[]) => void
  canObjectShow: (
    { type, id }: { type: string; id: number },
    showText?: boolean
  ) => boolean
  toggleSelectionMode: () => void
  isFocused({ id }: { id: number }): boolean
  isFocused(category: string): boolean
}

const initialFocus: Focus = {
  isMultipleSelectionMode: false,
  drawingType: LabelType.None,
  visibleType: Object.keys(LabelType).map((key) => LabelType[key]),
  category: null,
  objects: []
}

export const useFocus = () => {
  const focusRef = useRef<Focus>(initialFocus)
  const nowFocus = focusRef.current
  const update = useUpdate()

  const methods = {
    setDrawingType: (drawingType: LabelType = LabelType.None) => {
      focusRef.current.drawingType = drawingType
      if (drawingType) focusRef.current.objects = []
      update()
    },

    setObjects: (objects: Label[] = []) => {
      focusRef.current.objects = objects
      focusRef.current.category =
        mostRepeatedValue(objects.map(({ category }) => category)) || null
      update()
    },

    canObjectShow: (
      { type, id }: { type: string; id: number },
      showText: boolean = true
    ) =>
      (!nowFocus.objects.length && !nowFocus.drawingType) ||
      (nowFocus.objects.map(({ id }) => id).includes(id) &&
        (showText || type !== 'textbox')),

    toggleSelectionMode: () => {
      focusRef.current.isMultipleSelectionMode =
        !nowFocus.isMultipleSelectionMode
      update()
    },

    isFocused: (target: { id: number } | string) =>
      typeof target === 'string'
        ? nowFocus.objects.some(({ category }) => target === category)
        : nowFocus.objects.map(({ id }) => id).includes(target.id)
  }
  return { nowFocus, ...methods }
}
