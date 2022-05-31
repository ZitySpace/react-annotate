import React from 'react';
import { useContainer } from '../hooks/useContainer';
import { useData } from '../hooks/useData';
import { useKeyboard } from '../hooks/useKeyboard';
import { useSynchronizer } from '../hooks/useSynchronizer';
import { ImageData } from '../interfaces/basic';
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

  useKeyboard(dataOperation); // listeners for keyboard for support shortcuts.

  useSynchronizer(dataReady); // Core entrance

  return (
    <div className='w-full h-full flex flex-col justify-center items-center relative'>
      {Container}
      <OperationPanel />
      <ButtonBar dataOperation={dataOperation} />
    </div>
  );
};
