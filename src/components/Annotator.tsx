import React from 'react';
import { useContainer } from '../hooks/useContainer';
import { useData } from '../hooks/useData';
import { useKeyboard } from '../hooks/useKeyboard';
import { useSynchronizer } from '../hooks/useSynchronizer';
import { ImageData } from '../interfaces/basic';
import { ButtonBar } from './ButtonBar';
import { OperationPanel } from './OperationPanel';

export const Annotator = ({
  imagesList,
  initIndex = 0,
  getImage,
  onSave,
  onSwitch,
  onError,
}: {
  imagesList: ImageData[];
  initIndex?: number;
  getImage?: (imageName: string) => Promise<string>;
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
  onError?: (message: string, context: any) => void;
}) => {
  const Container = useContainer(); // Initialize canvas, set canvas dom's style and handle the resize event

  // handle data import/export
  const dataOperation = useData({
    imagesList,
    initIndex,
    getImage,
    onSave,
    onSwitch,
    onError,
  });

  // useKeyboard(dataOperation); // listeners for keyboard for support shortcuts.

  useSynchronizer(); // Core entrance

  return (
    <div className='w-full h-full flex flex-col justify-center items-center relative'>
      {Container}
      <OperationPanel />
      <ButtonBar dataOperation={dataOperation} />
    </div>
  );
};
