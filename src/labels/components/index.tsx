import React from 'react';
import Draggable from 'react-draggable';
import { useKeypointsComponents } from '../Keypoints/components';

export const useLabelComponents = () => {
  const keypointsComponents = useKeypointsComponents();

  const labelComponents = { ...keypointsComponents };

  return (
    <div className='ra-absolute ra-w-full ra-h-full ra-pb-9 ra-invisible'>
      <div className='ra-relative ra-h-full ra-p-2 ra-overflow-hidden'>
        {Object.entries(labelComponents).map(([sig, cp], i) => (
          <Draggable key={i} bounds='parent' handle={`#${sig}`}>
            {cp}
          </Draggable>
        ))}
      </div>
    </div>
  );
};
