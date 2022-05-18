import { LabelType } from '../classes/Label';
import { DataOperation } from './useData';
import { useStore } from 'zustand';
import { CanvasStore, CanvasStoreProps } from '../stores/CanvasStore';
import { SelectionStore, SelectionStoreProps } from '../stores/SelectionStore';

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
    objects: selectedObjects,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  const { prevImg, nextImg, save } = dataOperation;

  const deleteObj = () => deleteObjects(selectedObjects.map(({ id }) => id));

  const draw = (labelType: LabelType) => () =>
    setDrawType(drawType === labelType ? LabelType.None : labelType);

  const drawPoint = draw(LabelType.Point);
  const drawLine = draw(LabelType.Line);
  const drawRect = draw(LabelType.Rect);

  const plainShortcutMap = {
    Backspace: deleteObj,
    Delete: deleteObj,
    KeyR: drawRect,
    KeyO: drawPoint,
    KeyL: drawLine,
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

    const combinedShortcutMap = {
      KeyR: () => {
        if (!controlKey || auxiliaryKey) return;
        else if (canReset) reset();
        else throw new Error('Cannot reset.');
      },
      KeyZ: () => {
        if (!controlKey || altKey) return;

        if (!shiftKey && canUndo) undo();
        else if (!shiftKey && !canUndo) throw new Error('Cannot undo.');
        else if (shiftKey && canRedo) redo();
        else throw new Error('Cannot redo.');
      },
      KeyS: () => {
        if (!controlKey || auxiliaryKey) return;
        else if (canSave) save();
        else throw new Error('Cannot save.');
      },
    };

    try {
      if (controlKey || auxiliaryKey) combinedShortcutMap[code]();
      else plainShortcutMap[code]();
      event.preventDefault(); // prevent default event after execute such as save html
    } catch (error) {
      if (!(error instanceof TypeError)) console.log(error);
    }
  };

  window.onkeydown = keyboardEventRouter;
};
