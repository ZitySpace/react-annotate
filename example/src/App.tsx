import React from 'react';

import { Annotator, ImageData } from '@ZitySpace/react-annotate';

import { data as rect } from './rectangles';
import { RectLabel } from '@ZitySpace/react-annotate';
const imagesList: ImageData[] = rect.map((img) => ({
  ...img,
  name: img.filename,
  url: img.url.replace('images.cocodataset.org', 'localhost:3000'),
  annotations: img.annotations.map((anno: any, id: number) => {
    const { x, y, w, h, category } = anno;
    return new RectLabel({ x, y, w, h, id, category });
  }),
}));

// import { data as segm } from './segmentations';
// import { PolygonLabel } from '@ZitySpace/react-annotate';
// const imagesList: ImageData[] = segm.map((img) => ({
//   ...img,
//   name: img.filename,
//   annotations: img.annotations.map((anno: any, id: number) => {
//     const { points, category } = anno;
//     return new PolygonLabel({ points, id, category });
//   }),
// }));

const App = () => {
  return (
    <div className='h-screen w-screen'>
      <Annotator
        imagesList={imagesList}
        initIndex={6}
        onSave={console.log}
        onSwitch={() => {}}
        onError={console.log}
      />
    </div>
  );
};

export default App;
