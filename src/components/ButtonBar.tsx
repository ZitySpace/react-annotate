import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
  XIcon
} from '@heroicons/react/solid'
import React from 'react'
import { LabelType } from '../classes/Label'
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
  const { can, prev: undo, next: redo, reset, deleteObject } = stateStack

  const { redo: canRedo, undo: canUndo, reset: canReset, save: canSave } = can
  const {
    nowFocus: { drawingType, objects },
    setDrawingType
  } = focus

  const deleteObj = () => objects.forEach(({ id }) => deleteObject(id))

  const draw = (labelType: LabelType | null) => () =>
    setDrawingType(drawingType === labelType ? null : labelType)

  const drawPoint = draw(LabelType.Point)
  const drawLine = draw(LabelType.Line)
  const drawRect = draw(LabelType.Rect)

  const isDrawingMe = (labelType: LabelType | null) => drawingType === labelType
  const isDrawingPoint = isDrawingMe(LabelType.Point)
  const isDrawingLine = isDrawingMe(LabelType.Line)
  const isDrawingRect = isDrawingMe(LabelType.Rect)

  return (
    <div className='h-9 flex justify-center space-x-8 items-center absolute bottom-0'>
      <div className='flex justify-center space-x-1'>
        <Button
          onClick={() => {
            console.log('close clicked')
          }}
        >
          <XIcon className='w-4 h-4' />
        </Button>
      </div>

      <div className='flex justify-center space-x-1'>
        <Button canUse={!!objects.length} onClick={deleteObj}>
          <TrashIcon className='h-4 w-4' />
        </Button>

        <Button isUsing={isDrawingRect} onClick={drawRect}>
          <RectangleIcon />
        </Button>

        <Button isUsing={isDrawingPoint} onClick={drawPoint}>
          <PointIcon />
        </Button>

        <Button isUsing={isDrawingLine} onClick={drawLine}>
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

      <div className='flex justify-center space-x-1'>
        <Button canUse={true} onClick={prevImg}>
          <ChevronLeftIcon className='h-4 w-4' />
        </Button>

        <Button canUse={true} onClick={nextImg}>
          <ChevronRightIcon className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
