import React from 'react';
import { useStore } from 'zustand';
import { LabelType } from '../classes/Label';
import { DataOperation } from '../hooks/useData';
import { CanvasStore, CanvasStoreProps } from '../stores/CanvasStore';
import { CVStore, CVStoreProps } from '../stores/CVStore';
import { ImageMetaStore, ImageMetaStoreProps } from '../stores/ImageMetaStore';
import { SelectionStore, SelectionStoreProps } from '../stores/SelectionStore';
import { Button } from './Button';
import {
  AIIcon,
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

export const ButtonBar = ({
  dataOperation,
}: {
  dataOperation: DataOperation;
}) => {
  const { dataReady } = useStore(ImageMetaStore, (s: ImageMetaStoreProps) => s);
  const { ready: CVReady } = useStore(CVStore, (s: CVStoreProps) => s);

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
    AIMode,
    toggleAIMode,
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
    <div className='h-9 flex justify-center space-x-8 items-center absolute bottom-0 select-none'>
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

        <Button canUse={dataReady} isUsing={isDrawingRect} onClick={drawRect}>
          <RectangleIcon />
        </Button>

        <Button canUse={dataReady} isUsing={isDrawingPoint} onClick={drawPoint}>
          <PointIcon />
        </Button>

        <Button canUse={dataReady} isUsing={isDrawingLine} onClick={drawLine}>
          <LineIcon />
        </Button>

        <Button
          canUse={dataReady}
          isUsing={isDrawingPolygon}
          onClick={drawPolygon}
        >
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

        <Button
          canUse={CVReady}
          isUsing={AIMode}
          onClick={() => toggleAIMode(!AIMode)}
        >
          <AIIcon />
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
