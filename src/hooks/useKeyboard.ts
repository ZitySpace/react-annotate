import { useStore } from 'zustand';
import { LabelType } from '../labels';
import { CanvasStore, CanvasStoreProps } from '../stores/CanvasStore';
import { ImageMetaStore, ImageMetaStoreProps } from '../stores/ImageMetaStore';
import { SelectionStore, SelectionStoreProps } from '../stores/SelectionStore';
import { DataOperation } from './useData';

export const useKeyboard = (dataOperation: DataOperation) => {
  const { dataReady } = useStore(ImageMetaStore, (s: ImageMetaStoreProps) => s);

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
    setDrawType,
    toggleVisibility,
    labels: selectedLabels,
    selectLabels,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  const { prevImg, nextImg, save } = dataOperation;

  const deleteObj = () => {
    selectLabels([]);
    deleteObjects(selectedLabels.map(({ id }) => id));
  };

  const draw = (labelType: LabelType) => () =>
    dataReady &&
    setDrawType(drawType === labelType ? LabelType.None : labelType);

  const drawPoint = draw(LabelType.Point);
  const drawLine = draw(LabelType.Line);
  const drawBox = draw(LabelType.Box);
  const drawMask = draw(LabelType.Mask);

  const plainShortcutMapping = {
    Backspace: deleteObj,
    Delete: deleteObj,
    KeyR: drawBox,
    KeyO: drawPoint,
    KeyL: drawLine,
    KeyP: drawMask,
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

    const combinedShortcutMapping = {
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
      if (controlKey || auxiliaryKey) combinedShortcutMapping[code]();
      else plainShortcutMapping[code]();
    } catch (error) {
      if (!(error instanceof TypeError)) console.log(error);
    }
  };

  window.onkeydown = keyboardEventRouter;
};
