import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
  XIcon
} from '@heroicons/react/solid'
import React from 'react'
import { Can } from '../hooks/useStateStack'
import { Button } from './Button'
import {
  HeavyFloppyIcon,
  LineIcon,
  PointIcon,
  RectangleIcon,
  RedoIcon,
  ResetIcon,
  UndoIcon
} from './icons'

export const ButtonBar = ({
  can,
  next,
  prev
}: {
  can: Can
  next: (event: any) => void
  prev: (event: any) => void
}) => {
  console.log(can)

  return (
    <div id='test' className='flex justify-center items-center'>
      <div className='flex justify-center space-x-1 absolute bottom-0 right-1 md:right-1/4'>
        <Button canUse={true} onClick={prev}>
          <ChevronLeftIcon className='h-4 w-4' />
        </Button>

        <Button canUse={true} onClick={next}>
          <ChevronRightIcon className='h-4 w-4' />
        </Button>
      </div>

      <div className={`flex justify-center space-x-2 absolute bottom-0`}>
        <div className='flex justify-center space-x-1'>
          <Button
            canUse={false}
            onClick={() => {
              console.log('delete clicked')
            }}
          >
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

          <Button
            canUse={can.undo}
            onClick={() => {
              console.log('undo clicked')
            }}
          >
            <UndoIcon />
          </Button>

          <Button
            canUse={can.redo}
            onClick={() => {
              console.log('redo clicked')
            }}
          >
            <RedoIcon />
          </Button>

          <Button
            canUse={can.reset}
            onClick={() => {
              console.log('reset clicked')
            }}
          >
            <ResetIcon />
          </Button>

          <Button
            canUse={can.save}
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
