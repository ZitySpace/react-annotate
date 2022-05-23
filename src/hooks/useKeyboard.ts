import { useStore } from 'zustand';
import { LabelType } from '../classes/Label';
import { CanvasStore, CanvasStoreProps } from '../stores/CanvasStore';
import { SelectionStore, SelectionStoreProps } from '../stores/SelectionStore';
import { DataOperation } from './useData';

export const useKeyboard = (dataOperation: DataOperation) => {
  const [
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    canReset,
    canSave,
    deleteObjects,
  ] = useStore(CanvasStore, (s: CanvasStoreProps) => {
    return [
      s.undo,
      s.redo,
      s.reset,
      s.canUndo(),
      s.canRedo(),
      s.canReset(),
      s.canSave(),
      s.deleteObjects,
    ];
  });

  const {
    drawType,
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

  const plainShortcutMap = {
    Backspace: deleteObj,
    Delete: deleteObj,
    KeyR: drawRect,
    KeyO: drawPoint,
    KeyL: drawLine,
    KeyP: drawPolygon,
    KeyV: toggleVisibility,
    Period: nextImg,
    ArrowRight: nextImg,
    Comma: prevImg,
    ArrowLeft: prevImg,
  };

  const keyboardEventRouter = (event: KeyboardEvent) => {
    if (event['path'][0] instanceof HTMLInputElement) return; // prevent interfere keyboard input

    const { code, ctrlKey, metaKey, shiftKey, altKey } = event;
    const controlKey = ctrlKey || metaKey;
    const auxiliaryKey = shiftKey || altKey;

    const preventDefault = () => {
      event.preventDefault(); // prevent default event after execute such as save html
      event.stopPropagation(); // prevent event bubble up
    };

    const combinedShortcutMap = {
      KeyR: () => {
        preventDefault();
        if (!controlKey || auxiliaryKey) return;
        else if (canReset) reset();
        else throw new Error('Cannot reset.');
      },
      KeyZ: () => {
        preventDefault();
        if (!controlKey || altKey) return;

        if (!shiftKey && canUndo) undo();
        else if (!shiftKey && !canUndo) throw new Error('Cannot undo.');
        else if (shiftKey && canRedo) redo();
        else throw new Error('Cannot redo.');
      },
      KeyS: () => {
        preventDefault();
        if (!controlKey || auxiliaryKey) return;
        else if (canSave) save();
        else throw new Error('Cannot save.');
      },
    };

    try {
      if (controlKey || auxiliaryKey) combinedShortcutMap[code]();
      else plainShortcutMap[code]();
    } catch (error) {
      if (!(error instanceof TypeError)) console.log(error);
    }
  };

  window.onkeydown = keyboardEventRouter;
};
