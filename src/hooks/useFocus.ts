import { fabric } from 'fabric'
import { useRef } from 'react'
import { useUpdate } from 'react-use'
import { Focus } from '../interface/basic'
import { LABEL, Label } from '../label/Label'

export interface UseFocusReturnProps {
  now: Focus
  isFocused: ({
    categoryName,
    id
  }: {
    categoryName: string
    id?: number
  }) => boolean
  canObjectShow: ({
    categoryName,
    id,
    isText
  }: {
    categoryName: string | null
    id: number
    isText?: boolean
  }) => boolean
  setFocus: ({
    object,
    categoryName
  }: {
    object?: Label | fabric.Object | number
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
    // for canvas
    canObjectShow: ({
      categoryName,
      id,
      isText = false
    }: {
      categoryName: string | null
      id: number
      isText?: boolean
    }) =>
      focus.isDrawing || focus.objectId !== null // If is drawing mode or focusing a label now,
        ? focus.objectId === id && !isText // show corresponding non text object.
        : !(focus.categoryName && focus.categoryName !== categoryName), // Ohterwise, only the wrong category will not be displayed.

    // for category panel
    isFocused: ({ categoryName, id }: { categoryName: string; id?: number }) =>
      id !== undefined // If compare object,
        ? focus.objectId === id // compare their id,
        : focus.categoryName === categoryName, // Or not, compare the category

    setFocus: ({
      object,
      categoryName
    }: {
      object?: Label | fabric.Object | number
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
      } else if (typeof object === 'number') {
        focusRef.current = { ...focus, categoryName, objectId: object }
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
