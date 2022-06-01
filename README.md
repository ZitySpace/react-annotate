# react-annotate-image

[![NPM](https://img.shields.io/npm/v/react-annotate-image.svg)](https://www.npmjs.com/package/react-annotate-image) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

React component for computer vision dataset images annotate

## Status

Still under development.

## Usage

Add production version via `yarn add react-annotate-image`/`npm install react-annotate-image --save`, or `yarn link react-annotate-image` for development version.

### Simple Example

```ts
// import the component and css
import { Annotator } from 'react-annotate-image';
import 'react-annotate-image/dist/index.css';
...

const App = () => {
  ...
  return (
    <div className='h-screen w-screen'>
      <Annotator imagesList={imagesList} /> // use
    </div>
  );
};
```

For specific example, visit [here](./example/README.md)

### Options

- ⚠️ imagesList: required
  - type: ImageData[]
  - description: all the image and annotation data required
- initIndex: optional
  - type: number
  - description: first image's index
- onSave: optional
  - type: (curImageData: ImageData, curIndex: number, imagesList: ImageData[]) => void
  - description: will be invoked when the save button was clicked
- onSwitch: optional
  - type: (curImageData: ImageData, curIndex: number, imagesList: ImageData[], type: "prev" | "next") => void
  - description: will be invoked when the prev/next button was clicked

## Development this repo

1. run `yarn` to install dependencies in root path.
2. run `yarn start` to start the process which watch the files changes and build in real time. The process wouldn't stop until you press `ctrl + c`.
3. New a terminal and enter the **example** dir, then run `yarn` to install dependencies and run `yarn start` to start the development server.

## Documentation

### Keyboard shortcuts

- `Backspace` / `Delete`: delete the selected annotation
- `R`: toggle drawing mode to Rectangle
- `O`: toggle drawing mode to Point
- `L`: toggle drawing mode to Line
- `P`: toggle drawing mode to Polygon
- `V`: toggle annotations' visibility
- `<` / `←`: switch to previous image
- `>` / `→`: switch to next image

- `Ctrl`+`R` / `Cmd`+`R`: toggle annotation alter history between current and origin state
- `Ctrl`+`Z` / `Cmd`+`Z`: undo last annotation alter
- `Ctrl`+`Shift`+`Z` / `Cmd`+`Shift`+`Z`: redo last annotation alter
- `Ctrl`+`S` / `Cmd`+`S`: save annotations

## Reference

- [controls-customization](http://fabricjs.com/controls-customization)
- [effect of different setting](http://fabricjs.com/customization)
- [line-point-stickman](http://fabricjs.com/stickman)

## License

Apache 2.0 © [ZitySpace](https://github.com/ZitySpace)
