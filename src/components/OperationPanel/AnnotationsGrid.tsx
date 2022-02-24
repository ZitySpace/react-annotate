import React from 'react'
import { Label } from '../../classes/Label'
import { UseFocusReturnProps } from '../../hooks/useFocus'
import { IS_TOUCH_SCREEN } from '../../interfaces/config'

export const AnnotationsGrid = ({
  annotations,
  focus
}: {
  annotations: Label[]
  focus: UseFocusReturnProps
}) => {
  const {
    nowFocus: { isMultipleSelectionMode, objects },
    isFocused,
    setObjects
  } = focus

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const annoIndex = e.currentTarget['dataset']['annoIndex']
    const anno = annotations[annoIndex]
    const doesFocused = isFocused(anno)
    const newObjects = isMultipleSelectionMode
      ? objects.filter((o) => o !== anno)
      : []

    if (doesFocused) setObjects(newObjects)
    else setObjects([...newObjects, anno])
  }

  return (
    <div className='grid grid-cols-4 gap-1 mr-0.5 flex-row-reverse'>
      {annotations.map((anno, index) => (
        <div
          key={anno.id}
          className={`h-5 w-5 rounded-md flex justify-center items-center ${
            isFocused(anno) ? 'bg-indigo-600 text-gray-100' : 'bg-gray-200'
          } ${IS_TOUCH_SCREEN ? '' : 'hover:border-indigo-600 border'}`}
          data-anno-index={index}
          onClick={handleClick}
        >
          <span>{anno.id}</span>
        </div>
      ))}
    </div>
  )
}
