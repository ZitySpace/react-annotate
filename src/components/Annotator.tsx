import React, { useEffect, useRef } from 'react';
import { useContainer } from '../hooks/useContainer';
import { useData } from '../hooks/useData';
import { useLabels } from '../hooks/useLabels';
import { ImageData, LabeledImageData, LabelConfigs } from '../interfaces/basic';
import { setKeypointsLabelConfig } from '../labels/Keypoints';
import { ButtonBar } from './ButtonBar';
import { OperationPanel } from './OperationPanel';
import { annosToLabels } from '../utils';

export const Annotator = ({
  imagesList,
  initIndex = 0,
  categories,
  getImage,
  onSave,
  onError,
  onAddCategory,
  onRenameCategory,
  labelConfigs,
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
  labelConfigs?: LabelConfigs;
}) => {
  // transform raw Annotations in imagesList to Labels
  const imagesListRef = useRef<ImageData[]>([]);
  const labeledImagesListRef = useRef<LabeledImageData[]>([]);

  if (imagesListRef.current !== imagesList) {
    if (labelConfigs?.keypoints)
      setKeypointsLabelConfig(labelConfigs?.keypoints);

    labeledImagesListRef.current = imagesList.map((img) => ({
      ...img,
      annotations: annosToLabels(img.annotations),
    }));

    imagesListRef.current = imagesList;
  }

  // initialize canvas, set canvas dom's style and handle the resize event
  const Container = useContainer();

  // handle data import/export
  const dataOperation = useData({
    imagesList: labeledImagesListRef.current,
    initIndex,
    categories,
    getImage,
    onSave,
    onError,
  });

  // syncing logic
  const LabelComponents = useLabels();

  return (
    <div className='ra-w-full ra-h-full ra-flex ra-flex-col ra-justify-center ra-items-center ra-relative'>
      {Container}
      <OperationPanel
        imagesList={labeledImagesListRef.current}
        onAddCategory={onAddCategory}
        onRenameCategory={onRenameCategory}
      />
      {LabelComponents}
      <ButtonBar dataOperation={dataOperation} />
    </div>
  );
};
