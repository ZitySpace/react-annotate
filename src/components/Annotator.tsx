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
  categories,
  getImage,
  onSave,
  onError,
  onAddCategory,
  onRenameCategory,
}: {
  imagesList: ImageData[];
  initIndex?: number;
  categories?: string[];
  getImage?: (imageName: string) => Promise<string> | string;
  onSave: (curImageData: ImageData) => Promise<boolean> | boolean;
  onError?: (message: string, context?: any) => void;
  onAddCategory: (category: string) => Promise<boolean> | boolean;
  onRenameCategory: (
    oldCategory: string,
    newCategory: string,
    timestamp?: string
  ) => Promise<boolean> | boolean;
}) => {
  const Container = useContainer(); // Initialize canvas, set canvas dom's style and handle the resize event

  // handle data import/export
  const dataOperation = useData({
    imagesList,
    initIndex,
    getImage,
    onSave,
    onError,
  });

  // useKeyboard(dataOperation); // listeners for keyboard shortcuts.

  useSynchronizer(); // Core entrance

  return (
    <div className='ra-w-full ra-h-full ra-flex ra-flex-col ra-justify-center ra-items-center ra-relative'>
      {Container}
      <OperationPanel
        imagesList={imagesList}
        onAddCategory={onAddCategory}
        onRenameCategory={onRenameCategory}
      />
      <ButtonBar dataOperation={dataOperation} />
    </div>
  );
};
