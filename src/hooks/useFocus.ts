import { useMemo, useState } from 'react'
import { Focus } from '../interface/basic'

const initialFocus: Focus = {
  isDrawing: null,
  categoryName: null,
  objectId: null
}

export const useFocus = () => {
  const [focus, setFocus] = useState<Focus>(initialFocus)

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
      }
    }),
    [focus]
  )
  return { focus, setFocus, ...methods }
}
