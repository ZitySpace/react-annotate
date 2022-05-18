import React, { useState } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useColors } from '../hooks/useColor';
import { useContainer } from '../hooks/useContainer';
import { useData } from '../hooks/useData';
import { useFocus } from '../hooks/useFocus';
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
  const [isAnnosVisible] = useState(isAnnotationsVisible); // TODO: remove this global state or add setter and bind to button

  // Initialize the main variables
  const annoColors = useColors(); // handle colors' stuff.

  const Container = useContainer();
  const { dataReady, dataOperation } = useData(imagesList, index);
  const { loadListeners, syncCanvasToState } = useCanvas({
    dataReady,
    annoColors,
  });

  useMouse({
    annoColors,
    loadListeners,
    syncCanvasToState,
  });

  useKeyboard(dataOperation); // listeners for keyboard for support shortcuts.

  return isAnnosVisible ? (
    <div className='w-full h-full flex flex-col justify-center items-center relative'>
      {Container}
      <OperationPanel annoColors={annoColors} />
      <ButtonBar dataOperation={dataOperation} />
    </div>
  ) : null;
};
