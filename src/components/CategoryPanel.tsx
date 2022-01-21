import {
  CogIcon,
  MenuAlt2Icon,
  MenuAlt3Icon,
  MenuAlt4Icon,
  MenuIcon
} from '@heroicons/react/solid'
import React, { useState } from 'react'
import Draggable from 'react-draggable'
import { UseColorsReturnProps } from '../hooks/useColor'
import { UseFocusReturnProps } from '../hooks/useFocus'
import { IS_TOUCH_SCREEN } from '../interface/config'
import { Label } from '../label/Label'
import { getAbbreviation } from '../utils/util'

const MENU_ICONS = {
  0: MenuAlt4Icon,
  1: MenuIcon,
  2: MenuAlt2Icon,
  3: MenuAlt3Icon
}

export const CategoryPanel = ({
  groupedState,
  focus,
  annoColors
}: {
  groupedState: any
  focus: UseFocusReturnProps
  annoColors: UseColorsReturnProps
}) => {
  const [panelType, setPanelType] = useState<number>(1)
  const togglePanelType = () => setPanelType((panelType + 1) % 4)
  const MenuIcon = MENU_ICONS[panelType]

  const { setFocus, isFocused } = focus
  const { isDrawing } = focus.now

  const CategoryNameAndGearIcon = ({
    categoryName
  }: {
    categoryName: string
  }) => (
    <div
      className={`pb-1 static w-full flex justify-end ${
        panelType === 3 && !isFocused({ categoryName }) ? 'hidden' : ''
      }`}
    >
      <div
        className={`absolute left-0 transform -translate-x-6 md:-translate-x-8 ${
          !isDrawing && isFocused({ categoryName }) ? 'visible' : 'invisible'
        }`}
      >
        <CogIcon
          className={`w-6 h-6 md:w-8 md:h-8 ${
            // showCateEditBar TODO
            // category ? 'text-indigo-600' : 'text-gray-700'
            'text-indigo-600'
          } `}
        />
      </div>
      <span>{getAbbreviation(categoryName)}</span>
    </div>
  )

  const AnnotationIdGrid = ({
    categoryName,
    annotations
  }: {
    categoryName: string
    annotations: Label[]
  }) => (
    <div
      className={`grid grid-cols-3 gap-1 mr-0.5 flex-row-reverse ${
        panelType === 2 && !isFocused({ categoryName }) ? 'hidden' : ''
      } `}
    >
      {annotations.map((anno, idx) => {
        return (
          <div
            key={idx}
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
        )
      })}
    </div>
  )

  return (
    <div className='absolute w-full h-full pb-7 md:pb-9 invisible'>
      <div className={`relative h-full p-2 overflow-hidden`}>
        <Draggable
          bounds='parent'
          handle='#cate_handle'
          cancel='.selbar-state-icon'
        >
          <div className='bg-gray-100 bg-opacity-0 absolute top-2 right-2 visible rounded-md max-h-full w-24 flex flex-col items-end text-xs shadow-lg select-none'>
            <div
              id='cate_handle'
              className='bg-indigo-400 py-2 px-2 w-full rounded-t-md flex justify-between'
            >
              <span
                className='h-4 w-4 text-gray-700 selbar-state-icon'
                onClick={togglePanelType}
              >
                <MenuIcon />
              </span>
              category
            </div>
            <div
              className={`h-full w-full overflow-y-auto ${
                panelType ? '' : 'hidden'
              }`}
            >
              {Object.entries(groupedState).map(
                (
                  [categoryName, annotations]: [string, Label[]],
                  index: number
                ) => {
                  return (
                    <div
                      key={index}
                      className={`px-2 flex flex-col items-end w-full py-1 border-indigo-600 ${
                        isFocused({ categoryName }) ? 'border-l-8' : ''
                      }`}
                      style={{
                        backgroundColor: annoColors.get(categoryName)
                      }}
                      onClick={() => {
                        setFocus({ categoryName })
                      }}
                    >
                      <CategoryNameAndGearIcon categoryName={categoryName} />
                      <AnnotationIdGrid
                        categoryName={categoryName}
                        annotations={annotations}
                      />
                    </div>
                  )
                }
              )}
            </div>
          </div>
        </Draggable>
      </div>
    </div>
  )
}
