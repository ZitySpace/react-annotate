import React from 'react'
import { Label } from '../../classes/Label'
import { UseFocusReturnProps } from '../../hooks/useFocus'
import { IS_TOUCH_SCREEN } from '../../interfaces/config'

export const AnnotationsGrid = ({
  categoryName,
  annotations,
  panelType,
  focus
}: {
  categoryName: string
  annotations: Label[]
  panelType: number
  focus: UseFocusReturnProps
}) => {
  const { isFocused, setFocus } = focus
  return (
    <div
      className={`grid grid-cols-4 gap-1 mr-0.5 flex-row-reverse ${
        panelType === 2 && !isFocused({ categoryName }) ? 'hidden' : ''
      } `}
    >
      {annotations.map((anno) => (
        <div
          key={anno.id}
          className={`h-5 w-5 rounded-md flex justify-center items-center ${
            isFocused({ id: anno.id, categoryName })
              ? 'bg-indigo-600 text-gray-100'
              : 'bg-gray-200'
          } ${
            IS_TOUCH_SCREEN ? '' : 'hover:bg-indigo-600 hover:text-gray-100'
          }`}
          onClick={(e) => {
            e.stopPropagation()
            setFocus({ categoryName, object: anno.id })
          }}
        >
          <span>{anno.id}</span>
        </div>
      ))}
    </div>
  )
}
