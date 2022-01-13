import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
  XIcon
} from '@heroicons/react/solid'
import React from 'react'
import { UseFocusReturnProps } from '../hooks/useFocus'
import { UseStateStackReturnProps } from '../hooks/useStateStack'
import { Button } from './Button'
import {
  HeavyFloppyIcon,
  LineIcon,
  PointIcon,
  RectangleIcon,
  RedoIcon,
  ResetIcon,
  UndoIcon
} from './Icons'

export const ButtonBar = ({
  focus,
  stateStack,
  nextImg,
  prevImg
}: {
  focus: UseFocusReturnProps
  stateStack: UseStateStackReturnProps
  nextImg: (event: any) => void
  prevImg: (event: any) => void
}) => {
  // console.log(can)

  const {
    nowState,
    can,
    push: pushState,
    prev: undo,
    next: redo,
    reset
  } = stateStack

  const { redo: canRedo, undo: canUndo, reset: canReset, save: canSave } = can

  const deleteObj = () => {
    const newState = nowState.filter((anno) => anno.id !== focus.now.objectId)
    pushState(newState)
  }

  return (
    <div id='test' className='flex justify-center items-center'>
      <div className='flex justify-center space-x-1 absolute bottom-0 right-1 md:right-1/4'>
        <Button canUse={true} onClick={prevImg}>
          <ChevronLeftIcon className='h-4 w-4' />
        </Button>

        <Button canUse={true} onClick={nextImg}>
          <ChevronRightIcon className='h-4 w-4' />
        </Button>
      </div>

      <div className={`flex justify-center space-x-2 absolute bottom-0`}>
        <div className='flex justify-center space-x-1'>
          <Button canUse={!!focus.now.objectId} onClick={deleteObj}>
            <TrashIcon className='h-4 w-4' />
          </Button>

          <Button
            isUsing={false}
            onClick={() => {
              console.log('point clicked')
            }}
          >
            <RectangleIcon />
          </Button>

          <Button
            isUsing={false}
            onClick={() => {
              console.log('point clicked')
            }}
          >
            <PointIcon />
          </Button>

          <Button
            isUsing={false}
            onClick={() => {
              console.log('line clicked')
            }}
          >
            <LineIcon />
          </Button>

          <Button canUse={canUndo} onClick={undo}>
            <UndoIcon />
          </Button>

          <Button canUse={canRedo} onClick={redo}>
            <RedoIcon />
          </Button>

          <Button canUse={canReset} onClick={reset}>
            <ResetIcon />
          </Button>

          <Button
            canUse={canSave}
            onClick={() => {
              console.log('sava clicked')
            }}
          >
            <HeavyFloppyIcon />
          </Button>
        </div>
      </div>

      <div className='flex justify-center space-x-1 absolute bottom-0 left-1 md:left-1/4'>
        <Button
          onClick={() => {
            console.log('close clicked')
          }}
        >
          <XIcon className='w-4 h-4' />
        </Button>
      </div>
    </div>
  )
}
