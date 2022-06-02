import React from 'react';

import { Annotator, ImageData } from 'react-annotate-image';
import 'react-annotate-image/dist/index.css';

// import { data as rect } from './rectangles';
// import { RectLabel } from 'react-annotate-image';
// const imagesList: ImageData[] = rect.map((img) => ({
//   ...img,
//   annotations: img.annotations.map((anno: any, id: number) => {
//     const { x, y, w, h, category } = anno;
//     return new RectLabel({ x, y, w, h, id, category });
//   }),
// }));

import { data as segm } from './segmentations';
import { PolygonLabel } from 'react-annotate-image';
const imagesList: ImageData[] = segm.map((img) => ({
  ...img,
  annotations: img.annotations.map((anno: any, id: number) => {
    const { points, category } = anno;
    return new PolygonLabel({ points, id, category });
  }),
}));

const App = () => {
  return (
    <div className='h-screen w-screen'>
      <Annotator
        imagesList={imagesList}
        initIndex={6}
        onSave={console.log}
        onSwitch={console.log}
        onError={console.log}
      />
    </div>
  );
};

export default App;
