import React from 'react';

import { Annotator, ImageData } from '@ZitySpace/react-annotate';

// import { data as rect } from './rectangles';
// import { BoxLabel } from '@ZitySpace/react-annotate';
// const imagesList: ImageData[] = rect.map((img) => ({
//   ...img,
//   name: img.filename,
//   url: img.url.replace('images.cocodataset.org', 'localhost:3000'),
//   annotations: img.annotations.map((anno: any, id: number) => {
//     const { x, y, w, h, category } = anno;
//     return new BoxLabel({ x, y, w, h, id, category });
//   }),
// }));

import { data as segm } from './segmentations';
import { MaskLabel } from '@ZitySpace/react-annotate';
const imagesList: ImageData[] = segm.map((img) => ({
  ...img,
  name: img.filename,
  annotations: img.annotations.map((anno: any, id: number) => {
    const { points: points_, category } = anno;
    const points = Array.from({ length: points_.length / 2 }, (_, i) => ({
      x: points_[2 * i] as number,
      y: points_[2 * i + 1] as number,
    }));
    return new MaskLabel({
      paths: [{ points }],
      id,
      category: category as string,
    });
  }),
}));

const App = () => {
  return (
    <div className='h-screen w-screen'>
      <Annotator
        imagesList={imagesList}
        initIndex={6}
        onSave={(d: ImageData) => {
          console.log(d);
          return true;
        }}
        onError={(m: string, c: any) => {
          console.log(m, c);
        }}
        onAddCategory={(c: string) => {
          console.log('add new category ', c);
          return true;
        }}
        onRenameCategory={(o: string, n: string, t?: string) => {
          console.log(o, ' -> ', n, ' @ ', t);
          return true;
        }}
      />
    </div>
  );
};

export default App;
