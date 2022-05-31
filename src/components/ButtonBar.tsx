import React from 'react';
import { LabelType } from '../classes/Label';
import { DataOperation } from '../hooks/useData';
import { Button } from './Button';
import {
  CloseIcon,
  InvisibleIcon,
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
  VisibleIcon,
} from './Icons';
import { useStore } from 'zustand';
import { CanvasStore, CanvasStoreProps } from '../stores/CanvasStore';
import { SelectionStore, SelectionStoreProps } from '../stores/SelectionStore';

export const ButtonBar = ({
  dataOperation,
}: {
  dataOperation: DataOperation;
}) => {
  const {
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    canReset,
    canSave,
    deleteObjects,
  } = useStore(CanvasStore, (s: CanvasStoreProps) => s);

  const {
    drawType,
    visibleType,
    setDrawType,
    toggleVisibility,
    objects: selectedObjects,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  const { prevImg, nextImg, save } = dataOperation;

  const deleteObj = () => deleteObjects(selectedObjects.map(({ id }) => id));

  const draw = (labelType: LabelType) => () =>
    setDrawType(drawType === labelType ? LabelType.None : labelType);

  const drawPoint = draw(LabelType.Point);
  const drawLine = draw(LabelType.Line);
  const drawRect = draw(LabelType.Rect);
  const drawPolygon = draw(LabelType.Polygon);

  const isDrawingMe = (labelType: LabelType | null) => drawType === labelType;
  const isDrawingPoint = isDrawingMe(LabelType.Point);
  const isDrawingLine = isDrawingMe(LabelType.Line);
  const isDrawingRect = isDrawingMe(LabelType.Rect);
  const isDrawingPolygon = isDrawingMe(LabelType.Polygon);

  return (
    <div className='h-9 flex justify-center space-x-8 items-center absolute bottom-0'>
      <div className='flex justify-center space-x-1'>
        <Button
          onClick={() => {
            console.log('close clicked');
          }}
        >
          <CloseIcon />
        </Button>

        <Button onClick={toggleVisibility}>
          {visibleType.length ? <InvisibleIcon /> : <VisibleIcon />}
        </Button>
      </div>

      <div className='flex justify-center space-x-1'>
        <Button canUse={!!selectedObjects.length} onClick={deleteObj}>
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

        <Button canUse={canSave} onClick={save}>
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
  );
};
