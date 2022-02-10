import {
  ChevronDownIcon,
  MenuAlt2Icon,
  MenuAlt3Icon,
  MenuAlt4Icon,
  MenuIcon
} from '@heroicons/react/solid'
import { TrashIcon } from '@heroicons/react/outline'
import React, { FormEvent, useRef, useState } from 'react'
import Draggable from 'react-draggable'
import { UseFocusReturnProps } from '../hooks/useFocus'
import { IS_TOUCH_SCREEN } from '../interface/config'
import { Label } from '../classes/Label'
import { UseStateStackReturnProps } from '../hooks/useStateStack'
import { UseColorsReturnProps } from '../hooks/useColor'

const MENU_ICONS = {
  0: MenuAlt4Icon,
  1: MenuIcon,
  2: MenuAlt2Icon,
  3: MenuAlt3Icon
}

export const CategoryPanel = ({
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

  const { setFocus, isFocused, now: nowFocus } = focus
  const { groupedState, deleteObject, deleteCategory } = stateStack
  const labels = groupedState

  const inputCache = useRef<string>()
  const handleInput = (event: FormEvent) => {
    inputCache.current = event.target['value']
    console.log(inputCache.current)
  }

  const handleDelete = () => {
    nowFocus.objectId !== null && deleteObject(nowFocus.objectId!)
    nowFocus.objectId === null &&
      nowFocus.categoryName !== null &&
      deleteCategory(nowFocus.categoryName!)
  }

  const OperationPanel = ({ categoryName }: { categoryName: string }) => (
    <div
      className={`w-6 h-max ${isFocused({ categoryName }) ? '' : 'invisible'}`}
    >
      <button
        onClick={handleDelete}
        className='w-full h-full text-white bg-red-400 flex rounded-l-md'
      >
        <TrashIcon className='w-4 h-4 m-auto' />
      </button>
      {/* <div className='h-1/2 text-white bg-indigo-400 flex rounded-l-md'>
    <ColorSwatchIcon className='w-4 h-4 m-auto' />
  </div> */}
    </div>
  )

  const CategoryName = ({ categoryName }: { categoryName: string }) => (
    <div
      className={`pb-1 static w-full flex justify-end ${
        panelType === 3 && !isFocused({ categoryName }) ? 'hidden' : ''
      }`}
    >
      <button type='button' className='inline-flex -mr-1'>
        <input
          className='w-24 truncate bg-transparent text-center px-0.5 focus:border-none'
          defaultValue={categoryName}
          onInput={handleInput}
          onFocus={() => {
            inputCache.current = ''
          }}
          disabled={!isFocused({ categoryName })}
          type='text'
        />
        <ChevronDownIcon className='h-4 w-4 text-gray-400 mr-0 hidden' />
      </button>
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
                <div className='flex flex-row'>
                  <OperationPanel categoryName={categoryName} />

                  <div
                    key={categoryName}
                    className='w-28 p-2 flex flex-col items-end border-indigo-600'
                    style={{
                      backgroundColor: annoColors.get(categoryName)
                    }}
                    onClick={() => {
                      !isFocused({ categoryName }) && setFocus({ categoryName })
                    }}
                  >
                    <CategoryName categoryName={categoryName} />
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
