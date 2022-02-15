import {
  MenuAlt2Icon,
  MenuAlt3Icon,
  MenuAlt4Icon,
  MenuIcon
} from '@heroicons/react/solid'
import React, { useState } from 'react'
import Draggable from 'react-draggable'
import { Label } from '../../classes/Label'
import { UseColorsReturnProps } from '../../hooks/useColor'
import { UseFocusReturnProps } from '../../hooks/useFocus'
import { UseStateStackReturnProps } from '../../hooks/useStateStack'
import { IS_TOUCH_SCREEN } from '../../interfaces/config'
import { CategoryName } from './CategoryName'

const MENU_ICONS = {
  0: MenuAlt4Icon,
  1: MenuIcon,
  2: MenuAlt2Icon,
  3: MenuAlt3Icon
}

export const OperationPanel = ({
  stateStack,
  focus,
  annoColors
}: {
  stateStack: UseStateStackReturnProps
  focus: UseFocusReturnProps
  annoColors: UseColorsReturnProps
}) => {
  const [panelType, setPanelType] = useState<number>(1)
  const togglePanelType = () => setPanelType((prevType) => (prevType + 1) % 4)
  const MenuIcon = MENU_ICONS[panelType]

  const { setFocus, isFocused } = focus
  const { groupedState, renameCategory } = stateStack
  const labels = groupedState

  const AnnotationIdGrid = ({
    categoryName,
    annotations
  }: {
    categoryName: string
    annotations: Label[]
  }) => (
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

  return (
    <div className='absolute w-full h-full pb-7 md:pb-9 invisible'>
      <div className='relative h-full p-2 overflow-hidden'>
        <Draggable
          bounds='parent'
          handle='.cate_handle'
          cancel='.selbar-state-icon'
        >
          <div className='bg-gray-100 bg-opacity-0 absolute bottom-2 right-2 visible max-h-full w-34 flex flex-col items-end text-xs select-none'>
            <div className='bg-indigo-400 py-2 px-2 w-28 rounded-t-md flex justify-between cate_handle'>
              <MenuIcon
                onClick={togglePanelType}
                className='h-4 w-4 text-gray-700 selbar-state-icon'
              />
              <span className='mx-auto'>Category</span>
            </div>

            <div
              className={`h-full w-full overflow-y-auto${
                panelType ? '' : 'hidden'
              }`}
            >
              {labels.map(([categoryName, annotations]: [string, Label[]]) => (
                <div className='flex flex-row' key={categoryName}>
                  <div
                    className='w-28 p-2 flex flex-col items-end border-indigo-600'
                    style={{
                      backgroundColor: annoColors.get(categoryName)
                    }}
                    onClick={() => {
                      !isFocused({ categoryName }) && setFocus({ categoryName })
                    }}
                  >
                    <CategoryName
                      categoryName={categoryName}
                      panelType={panelType}
                      focus={isFocused({ categoryName })}
                      renameCategory={renameCategory}
                    />
                    <AnnotationIdGrid
                      categoryName={categoryName}
                      annotations={annotations}
                    />
                  </div>
                </div>
              ))}
              {/* <div 
                onClick={addCategory}
                className='text-gray-700 hover:bg-indigo-600 hover:text-white'
              >
                <PlusSmIcon className='w-5 h-5 m-auto' />
              </div> */}
            </div>
          </div>
        </Draggable>
      </div>
    </div>
  )
}
