# react-annotate

Play with the [demo](https://react-annotate-demo.vercel.app/)

## Install

```bash
npm install @zityspace/react-annotate
```

## Get started

Simple example to annotate bounding boxes:

```tsx
import { Annotator, ImageData, BoxLabel } from '@zityspace/react-annotate';

const Example = () => {
  // fake a batch (or one page) of annotations fetched from an api or a local file
  const imagesListRaw = [
    {
      name: '000000261061.jpg',
      height: 334,
      width: 500,
      url: 'http://images.cocodataset.org/val2017/000000261061.jpg',
      annotations: [
        {
          category: 'person',
          x: 260.16,
          y: 41.7,
          w: 111.51,
          h: 292.3,
        },
        {
          category: 'baseball bat',
          x: 132.41,
          y: 229.89,
          w: 112.82,
          h: 9.4,
        },
        {
          category: 'potted plant',
          x: 164.96,
          y: 98.06,
          w: 39.82,
          h: 54.85,
        },
      ],
    },
    // more images with annotations as above
  ];

  const imagesList: ImageData[] = imagesListRaw.map((image) => ({
    ...image,
    annotations: image.annotations.map(
      (box, id) => new BoxLabel({ ...box, id })
    ),
  }));

  return (
    <Annotator
      imagesList={imagesList}
      initIndex={0}
      onSave={(image: ImageData) => {
        console.log(image);
        return true;
      }}
      onError={(msg: string, context: any) => {
        console.log(msg, context);
      }}
      onAddCategory={(category: string) => {
        console.log('add new category ', category);
        return true;
      }}
      onRenameCategory={(
        oldName: string,
        newName: string,
        timestamp?: string
      ) => {
        console.log(oldName, ' -> ', newName, ' @ ', timestamp);
        return true;
      }}
    />
  );
};
```

The classes you will use are `Annotator`, `ImageData` and different types of label `PointLabel`, `BoxLabel`, `MaskLabel` etc.

Typically, the whole process is first fetch a batch of annotations with image meta information and annotations on each image, then transform the annotations on each image into interested labels, and lastly feed them into the `Annotator`, there you get a nice UI for annotation. The complete props for `Annotator` are:

```typescript
{
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
}
```

You can either specify url for each image, or pass in a `getImage()` function, which uses the image name to request the image blob and then return `URL.createObjectURL(imageBlob)`. It is also recommended to pass in `categorie` of the whole dataset to `Annotator`. Otherwise it will be infered from `imagesList`, which is only one batch of annotations thus the infered `categories` is not complete.

**Import:** _react-annotate is only an annotation ui component, it does not contain the logic to persist the changes of annotations. Therefore you need to implement `onSave()`, `onAddCategory()` and `onRenameCategory()`, typically api calls to your backend, to persist the changes. Otherwise, after loading a new batch of annotations, the changes on previous batch will be lost. Switching to the prev/next image and if current image annotation has been changed, it will trigger `onSave()`; when adding a new category or renaming a category, it will trigger `onAddCategory()` and `onRenameCategory()`. The optional `onError()` handles the failure of loading an image._

## Concepts

Major concepts are: `Label`, `RenderMode`, `ListenerGroup`, `StateStack`. Currently this library supports 5 label types: `PointLabel`, `LineLabel`, `BoxLabel`, `PolylineLabel`, `MaskLabel`. `Label` is their base class.

For each label, it can be in different `RenderMode`: _hidden_, _preview_, _drawing_, _selected_. All labels of an image are initially rendered with _preview_ mode. When adding/drawing a new label, all existed labels are in _hidden_ mode, and the label on drawing is in _drawing_ mode. Labels can be selected/filtered by clicking on the canvas objects, or clicking on the category and ids. Nonselected labels will be in _hidden_ mode, while selected labels will be in _selected_ mode, or _preview_ mode depending on how many labels are selected.

A `ListenerGroup` is a set of event listeners that will get registered on the canvas, it dictates what interactions you can have with the canvas and labels. As an example, when adding/drawing a new `BoxLabel`, then `box:draw` listener group will be registered for the canvas, when editing a `LineLabel`, then `line:edit` listener group will be registered, when mouse is not over any label, then the canvas transists to `default` listener group. Each label type typically has `:draw` and `:edit` listener groups, for some label types that involve more complicated interactions, you may need to implement extra listener groups such as `:edit:advanced` for `PolylineLabel` and `MaskLabel`.

Such design gives great flexibility to extend to new label types. Basically with the following decided, you can create a new label type: 1. what data props/keys are needed to construct the new label type, 2. how to render the label at each `RenderMode`, 3. what's the interaction when drawing/editing this label. However, in your implementation of listener groups for a new label type, you have to be careful to take care of transitions between different listener groups.

Data props that are needed to construct each label type are straightforward:

```typescript
// x: number, y: number, id: number, category: string ...
const aPointLabel = new PointLabel({
  x,
  y,
  category,
  id,
});

const aLineLabel = new LineLabel({
  x1,
  y1,
  x2,
  y2,
  category,
  id,
});

const aBoxLabel = new BoxLabel({
  x,
  y,
  w,
  h,
  category,
  id,
});

// paths: {x: number; y: number}[][]
// Why it is 2D paths instead of 1D path?
// We want to support advanced editing that one Polyline can be break into
// multiple sub-polylines as intermediate state and in the end get connected
// and merged back as a single polyline
const aPolylineLabel = new PolylineLabel({
  paths,
  category,
  id,
});

// paths: { points: {x: number; y: number}[]; closed?: boolean; hole?: boolean }[]
// The simplest mask can be seemed as one closed path. A mask with holes can be
// seemed as multiple paths with some of them hole = true. Like PolylineLabel, a
// mask (or closed path) can also be break into multiple open paths as intermediate
// state and in the end get connected and merged back as closed paths.
const aMaskLabel = new MaskLabel({
  paths,
  category,
  id,
});
```

## How to annotate

## Create your own label type

## Limitations

The design of this library tries to strike a balance between the optimization of the annotation experience for each label type, and the consistency of the implementations among all the label types. Currently this leads to certain limitations:

- Touch screen is not supported
- Display on small screen is not optimized
- The library is based on [fabricjs](https://github.com/fabricjs/fabric.js), which limits the label types and certain interactions. However, we are not limited in terms of what to use underhood, as we integrate more labels, we might bring in other lower level dependancies best suited for that label type.

## Why another annotation tool

There are already many [awesome-data-annotation](https://github.com/taivop/awesome-data-annotation) options, why bother making another one? We think an ideal annotation tool should be portable, slim and smart. AI is moving fast, the future AI development experience will be mostly on web in a low code manner, so many of the QT based tools will become obsolete, annotation tool as a react/vue component, or an electron app seems a natural choice. Some of the current options are indeed built on the webpage, however besides pure annotation they tend to also include many data management functions. Based on your need this could be an advantage or disadvantage. If you want to control the data management part and only seek for a pure annotation option, give this tool a try. If the labels currently have don't fit your requirements, you can add a new customized label type. Lastly, some of the best annotation experiences are powered by AI models, but they are usually behind a commercialized product. Given the fact that so many open sourced AI models and cheap apis available, isn't it awesome if we could wire up these AI "magics" with our annotation experience through a simple interface. We are not there yet, but that's the motivation for us to build this tool.

## License

Apache 2.0 © [ZitySpace](https://github.com/ZitySpace)
