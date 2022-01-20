import { fabric } from 'fabric'
import { useRef } from 'react'
import { useUpdate } from 'react-use'
import { Focus } from '../interface/basic'
import { LABEL, Label } from '../label/Label'

export interface UseFocusReturnProps {
  now: Focus
  isFocused: (
    categoryName: string | null,
    id: number,
    isText: boolean
  ) => boolean
  setFocus: ({
    object,
    categoryName
  }: {
    object?: Label | fabric.Object
    categoryName?: string | null
  }) => void
  setDrawing: (drawing: string | null) => void
}

const initialFocus: Focus = {
  isDrawing: null,
  categoryName: null,
  objectId: null
}

export const useFocus = () => {
  const focusRef = useRef<Focus>(initialFocus)
  const focus = focusRef.current
  const update = useUpdate()

  const methods = {
    isFocused: (
      categoryName: string | null,
      id: number,
      isText: boolean = false
    ) =>
      focus.isDrawing
        ? focus.objectId === id && !isText // if in drawing mode show the drawing object which is not text
        : focus.categoryName === null || // if not in drawing mode and not focus on any special category
          (focus.categoryName === categoryName && // if focus specific category
            (focus.objectId === null || (focus.objectId === id && !isText))), // should specify not text object or any object

    setFocus: ({
      object,
      categoryName
    }: {
      object?: Label | fabric.Object
      categoryName?: string | null
    }) => {
      if (!object && !categoryName)
        // usage: setObject({}) not focus on any classes or objects
        focusRef.current = { ...focus, objectId: null, categoryName: null }
      else if (categoryName)
        // usage: setObject({categoryName}) only focus category and not focus object
        focusRef.current = { ...focus, objectId: null, categoryName }
      // focus object via instance of fabric' object or label
      else if (object instanceof LABEL) {
        const { id, categoryName } = object
        focusRef.current = { ...focus, categoryName, objectId: id }
      } else if (object instanceof fabric.Object) {
        const { id, categoryName } = object as any
        if (id !== (null || undefined) && categoryName)
          focusRef.current = { ...focus, categoryName, objectId: id }
      }
      update()
    },

    setDrawing: (drawing: string | null) => {
      focusRef.current.isDrawing = drawing
      update()
    }
  }
  return { now: focus, ...methods }
}
