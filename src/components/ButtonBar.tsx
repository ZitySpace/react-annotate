import React from 'react';
import { useStore } from 'zustand';
import { LabelType } from '../labels';
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
  PolylineIcon,
  PolygonIcon,
  KeypointsIcon,
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
  const {
    ready: CVReady,
    AIMode,
    toggleAIMode,
  } = useStore(CVStore, (s: CVStoreProps) => s);

  const {
    curState: getCurState,
    undo: undoState,
    redo: redoState,
    reset: resetState,
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
    labels: selectedLabels,
    selectLabels,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  const { prevImg, nextImg, save } = dataOperation;

  const undo = () => {
    const ids = selectedLabels.map((l) => l.id);
    if (!undoState()) return;

    const curState = getCurState();
    selectLabels(curState.filter((label) => ids.includes(label.id)));
  };

  const redo = () => {
    const ids = selectedLabels.map((l) => l.id);
    if (!redoState()) return;

    const curState = getCurState();
    selectLabels(curState.filter((label) => ids.includes(label.id)));
  };

  const reset = () => {
    const ids = selectedLabels.map((l) => l.id);
    if (!resetState()) return;

    const curState = getCurState();
    selectLabels(curState.filter((label) => ids.includes(label.id)));
  };

  const deleteObj = () => {
    selectLabels([]);
    deleteObjects(selectedLabels.map(({ id }) => id));
  };

  const draw = (labelType: LabelType) => () =>
    setDrawType(drawType === labelType ? LabelType.None : labelType);

  const drawPoint = draw(LabelType.Point);
  const drawLine = draw(LabelType.Line);
  const drawBox = draw(LabelType.Box);
  const drawPolyline = draw(LabelType.Polyline);
  const drawPolygon = draw(LabelType.Mask);
  const drawKeypoints = draw(LabelType.Keypoints);

  const isDrawingMe = (labelType: LabelType | null) => drawType === labelType;
  const isDrawingPoint = isDrawingMe(LabelType.Point);
  const isDrawingLine = isDrawingMe(LabelType.Line);
  const isDrawingBox = isDrawingMe(LabelType.Box);
  const isDrawingPolyline = isDrawingMe(LabelType.Polyline);
  const isDrawingPolygon = isDrawingMe(LabelType.Mask);
  const isDrawingKeypoints = isDrawingMe(LabelType.Keypoints);
  const isDrawing = drawType !== LabelType.None;

  return (
    <div className='ra-h-9 ra-flex ra-justify-center ra-space-x-8 ra-items-center ra-absolute ra-bottom-0 ra-select-none'>
      <div className='ra-flex ra-justify-center ra-space-x-1'>
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

      <div className='ra-flex ra-justify-center ra-space-x-1'>
        <Button canUse={!!selectedLabels.length} onClick={deleteObj}>
          <TrashIcon />
        </Button>

        <Button canUse={dataReady} isUsing={isDrawingBox} onClick={drawBox}>
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
          isUsing={isDrawingPolyline}
          onClick={drawPolyline}
        >
          <PolylineIcon />
        </Button>

        <Button
          canUse={dataReady}
          isUsing={isDrawingPolygon}
          onClick={drawPolygon}
        >
          <PolygonIcon />
        </Button>

        <Button
          canUse={dataReady}
          isUsing={isDrawingKeypoints}
          onClick={drawKeypoints}
        >
          <KeypointsIcon />
        </Button>

        <Button canUse={canUndo && !isDrawing} onClick={undo}>
          <UndoIcon />
        </Button>

        <Button canUse={canRedo && !isDrawing} onClick={redo}>
          <RedoIcon />
        </Button>

        <Button canUse={canReset && !isDrawing} onClick={reset}>
          <ResetIcon />
        </Button>

        <Button canUse={canSave} onClick={save}>
          <SaveIcon />
        </Button>

        <Button canUse={CVReady} isUsing={AIMode} onClick={toggleAIMode}>
          <AIIcon />
        </Button>
      </div>

      <div className='ra-flex ra-justify-center ra-space-x-1'>
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
