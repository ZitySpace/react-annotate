import React from 'react';
import { useContainer } from '../hooks/useContainer';
import { useData } from '../hooks/useData';
import { useKeyboard } from '../hooks/useKeyboard';
import { useSynchronizer } from '../hooks/useSynchronizer';
import { ImageData } from '../interfaces/basic';
import { ButtonBar } from './ButtonBar';
import { OperationPanel } from './OperationPanel';

import { useStore } from 'zustand';
import { InspectStore, InspectStoreProps } from '../stores/InspectStore';

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
  getImage?: (imageName: string) => Promise<string>;
  onSave: (curImageData: ImageData) => boolean;
  onError?: (message: string, context?: any) => void;
  onAddCategory: (category: string) => boolean;
  onRenameCategory: (
    oldCategory: string,
    newCategory: string,
    timestamp?: string
  ) => boolean;
}) => {
  const { lgroup, rmode } = useStore(InspectStore, (s: InspectStoreProps) => s);

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

      <div className='ra-absolute ra-top-32 ra-left-10 ra-w-40 ra-h-auto ra-rounded-md ra-border ra-bg-white ra-p-2 ra-shadow-sm ra-flex ra-flex-col ra-justify-start ra-items-center ra-space-y-4'>
        <span className='ra-text-sm'>Current listener group</span>
        <span className='ra-text-lg'>{lgroup}</span>
        <span className='ra-text-sm'>Label render mode</span>
        <div className='ra-flex ra-flex-col ra-space-y-1'>
          {rmode.map((m, i) => (
            <div
              key={i}
              className='ra-flex ra-justify-left ra-space-x-4 ra-text-lg'
            >
              <span>{m.id}</span>
              <span>{m.mode}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
