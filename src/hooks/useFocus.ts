import { fabric } from 'fabric'
import { useMemo, useRef } from 'react'
import { useUpdate } from 'react-use'
import { Focus, LABEL, Label } from '../interface/basic'

export interface UseFocusReturnProps {
  now: Focus
  isFocused: (
    categoryName: string | null,
    id: number,
    isText: boolean
  ) => boolean
  setObject: (object?: Label | fabric.Object) => void
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

  const methods = useMemo(
    () => ({
      isFocused: (
        categoryName: string | null,
        id: number,
        isText: boolean = false
      ) => {
        return (
          !focus.isDrawing &&
          (focus.categoryName === null ||
            (focus.categoryName === categoryName &&
              (focus.objectId === null || (focus.objectId === id && !isText))))
        )
      },
      setObject: (object?: Label | fabric.Object) => {
        if (!object) {
          focusRef.current = { ...focus, objectId: null }
        } else if (object instanceof LABEL) {
          const { id, categoryName } = object
          focusRef.current = { ...focus, categoryName, objectId: id }
        } else if (object instanceof fabric.Object) {
          const { id, categoryName } = object as any
          if (id && categoryName)
            focusRef.current = { ...focus, categoryName, objectId: id }
        }
        update()
      },
      setDrawing: (drawing: string | null) => {
        focusRef.current.isDrawing = drawing
        update()
      }
    }),
    [focus]
  )
  return { now: focus, ...methods }
}
