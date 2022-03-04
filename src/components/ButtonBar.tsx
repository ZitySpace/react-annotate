import React from 'react'
import { LabelType } from '../classes/Label'
import { UseFocusReturnProps } from '../hooks/useFocus'
import { UseStateStackReturnProps } from '../hooks/useStateStack'
import { Button } from './Button'
import {
  CloseIcon,
  LineIcon,
  NextIcon,
  PervIcon,
  PointIcon,
  PolygonIcon,
  RectangleIcon,
  RedoIcon,
  ResetIcon,
  SaveIcon,
  TrashIcon,
  UndoIcon,
  VisibleIcon
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
  const { can, prev: undo, next: redo, reset, deleteObjects } = stateStack

  const { redo: canRedo, undo: canUndo, reset: canReset, save: canSave } = can
  const {
    nowFocus: { drawingType, objects },
    setDrawingType
  } = focus

  const deleteObj = () => deleteObjects(objects.map(({ id }) => id))

  const draw = (labelType: LabelType) => () =>
    setDrawingType(drawingType === labelType ? LabelType.None : labelType)

  const drawPoint = draw(LabelType.Point)
  const drawLine = draw(LabelType.Line)
  const drawRect = draw(LabelType.Rect)
  const drawPolygon = draw(LabelType.Polygon)

  const isDrawingMe = (labelType: LabelType | null) => drawingType === labelType
  const isDrawingPoint = isDrawingMe(LabelType.Point)
  const isDrawingLine = isDrawingMe(LabelType.Line)
  const isDrawingRect = isDrawingMe(LabelType.Rect)
  const isDrawingPolygon = isDrawingMe(LabelType.Polygon)

  return (
    <div className='h-9 flex justify-center space-x-8 items-center absolute bottom-0'>
      <div className='flex justify-center space-x-1'>
        <Button
          onClick={() => {
            console.log('close clicked')
          }}
        >
          <CloseIcon />
        </Button>

        <Button onClick={() => {}}>
          <VisibleIcon />
        </Button>
      </div>

      <div className='flex justify-center space-x-1'>
        <Button canUse={!!objects.length} onClick={deleteObj}>
          <TrashIcon />
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

        <Button isUsing={isDrawingPolygon} onClick={drawPolygon}>
          <PolygonIcon />
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
            console.log('save clicked')
          }}
        >
          <SaveIcon />
        </Button>
      </div>

      <div className='flex justify-center space-x-1'>
        <Button canUse={true} onClick={prevImg}>
          <PervIcon />
        </Button>

        <Button canUse={true} onClick={nextImg}>
          <NextIcon />
        </Button>
      </div>
    </div>
  )
}
