import React, { useState } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useContainer } from '../hooks/useContainer';
import { useData } from '../hooks/useData';
import { useKeyboard } from '../hooks/useKeyboard';
import { useMouse } from '../hooks/useMouse';
import { ImageData } from '../interfaces/basic';
import '../tailwind.css';
import { ButtonBar } from './ButtonBar';
import { OperationPanel } from './OperationPanel';

export const Annotator = ({
  imagesList,
  index = 0,
  isAnnotationsVisible = true,
  categoryColors,
  categories,
  colors,
}: {
  imagesList: ImageData[];
  index?: number;
  isAnnotationsVisible?: boolean;
  categoryColors?: Map<string, string>;
  categories?: string[];
  colors?: string[];
  onSwitchVisible?: Function; // TODO: bind to button
}) => {
  // TODO: remove this global state or add setter and bind to button
  const [isAnnosVisible] = useState(isAnnotationsVisible);
  const nothing = {
    categoryColors,
    categories,
    colors,
  };
  !nothing;

  const Container = useContainer();
  const { dataReady, dataOperation } = useData(imagesList, index);
  const { syncCanvasToState } = useCanvas(dataReady);

  useMouse(syncCanvasToState);
  useKeyboard(dataOperation); // listeners for keyboard for support shortcuts.

  return isAnnosVisible ? (
    <div className='w-full h-full flex flex-col justify-center items-center relative'>
      {Container}
      <OperationPanel />
      <ButtonBar dataOperation={dataOperation} />
    </div>
  ) : null;
};
