# react-annotate

Play with the [demo](https://react-annotate-demo.vercel.app/).

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

The classes you will use are `Annotator`, `ImageData` and different labels `PointLabel`, `BoxLabel`, `MaskLabel` etc.

Typically, the whole process is first fetch a batch of annotations with image meta information and annotations on each image, then transform the annotations on each image into interested labels, and lastly feed them into the `Annotator`, there you get a nice UI for annotation.

**Import Note:** _react-annotate is only an annotation ui component, it does not contain the logic to persist the changes of annotations. Therefore you need to implement `onSave()`, `onAddCategory()` and `onRenameCategory()`, typically api calls to your backend, to persist the changes. Otherwise, after loading a new batch of annotations, the changes on previous batch will be lost. `onError()` handles the failure of loading an image but is optional._

## Concepts

## How to annotate

## Create your own label

## Limitations

The design of this library tries to strike a balance between the optimization of the annotation experience for each label, and the consistency of the implementations among all labels. Currently this leads to certain limitations:

- Touch screen is not supported
- Display on small screen is not optimized
- The library is based on [fabricjs](https://github.com/fabricjs/fabric.js), which limits the label types and certain interactions. However, we are not limited in terms of what to use underhood, as we integrate more labels, we might bring in other lower level dependancies best suited for that label.

## Why another annotation tool

There are already many [awesome-data-annotation](https://github.com/taivop/awesome-data-annotation) options, why bother making another one? We think an ideal annotation tool should be portable, slim and smart. AI is moving fast, the future AI development experience will be mostly on web in a low code manner, so many of the QT based tools will become obsolete, annotation tool as a react/vue component, or an electron app seems a natural choice. Some of the current options are indeed built on the webpage, however besides pure annotation they tend to also include many data management functions. Based on your need this could be an advantage or disadvantage. If you want to control the data management part and only seek for a pure annotation option, give this tool a try. If the labels currently have don't fit your requirements, you can add a new customized label. Lastly, some of the best annotation experiences are powered by AI models, but they are usually behind a commercialized product. Given the fact that so many open sourced AI models and cheap apis available, isn't it awesome if we could wire up these AI "magics" with our annotation experience through a simple interface. We are not there yet, but that's the motivation for us to build this tool.

## License

Apache 2.0 © [ZitySpace](https://github.com/ZitySpace)
