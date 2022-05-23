# react-annotate-image

[![NPM](https://img.shields.io/npm/v/react-annotate-image.svg)](https://www.npmjs.com/package/react-annotate-image) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

React component for computer vision dataset images annotate

## Status

Still under development.

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

## Development this repo

1. run `yarn` to install dependencies in root path.
2. run `yarn start` to start the process which watch the files changes and build in real time. The process wouldn't stop until you press `ctrl + c`.
3. New a terminal and enter the **example** dir, then run `yarn` to install dependencies and run `yarn start` to start the development server.

## Reference

- [controls-customization](http://fabricjs.com/controls-customization)
- [effect of different setting](http://fabricjs.com/customization)
- [line-point-stickman](http://fabricjs.com/stickman)

## License

Apache 2.0 © [ZitySpace](https://github.com/ZitySpace)
