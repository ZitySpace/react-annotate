import React, { useEffect } from 'react';
import { useStore } from 'zustand';
import { useCanvas } from '../hooks/useCanvas';
import { useContainer } from '../hooks/useContainer';
import { useData } from '../hooks/useData';
import { useKeyboard } from '../hooks/useKeyboard';
import { useMouse } from '../hooks/useMouse';
import { ImageData } from '../interfaces/basic';
import {
  CanvasMetaStore,
  CanvasMetaStoreProps,
} from '../stores/CanvasMetaStore';
import '../tailwind.css';
import { ButtonBar } from './ButtonBar';
import { OperationPanel } from './OperationPanel';

export const Annotator = ({
  imagesList,
  initIndex = 0,
  onSave,
  onSwitch,
}: {
  imagesList: ImageData[];
  initIndex?: number;
  onSave?: (
    curImageData: ImageData,
    curIndex: number,
    imagesList: ImageData[]
  ) => void;
  onSwitch?: (
    curImageData: ImageData,
    curIndex: number,
    imagesList: ImageData[],
    type: 'prev' | 'next'
  ) => void;
}) => {
  const Container = useContainer(); // Initialize canvas, set canvas dom's style and handle the resize event

  // handle data import/export
  const { dataReady, dataOperation } = useData({
    imagesList,
    initIndex,
    onSave,
    onSwitch,
  });

  const canvasListeners = useCanvas(dataReady);
  const mouseListeners = useMouse();

  const canvas = useStore(
    CanvasMetaStore,
    (s: CanvasMetaStoreProps) => s.canvas
  );

  // mount listeners to canvas when canvas is ready
  useEffect(() => {
    if (!canvas) return;
    canvas.off();
    Object.entries({ ...canvasListeners, ...mouseListeners }).forEach(
      ([event, handler]) => canvas.on(event, handler)
    );
  }, [canvas, canvasListeners, mouseListeners]);

  useKeyboard(dataOperation); // listeners for keyboard for support shortcuts.

  return (
    <div className='w-full h-full flex flex-col justify-center items-center relative'>
      {Container}
      <OperationPanel />
      <ButtonBar dataOperation={dataOperation} />
    </div>
  );
};
