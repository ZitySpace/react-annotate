import { fabric } from 'fabric';

import { setup } from '../listeners/setup';
import { parseEvent, getBoundedValue } from '../utils';
import { UNKNOWN_CATEGORY_NAME } from '../config';
import { CoordSystemType, LabelRenderMode, LabeledObject } from '../Base';
import { KeypointsLabel } from './label';

export const useKeypointsListeners = (syncCanvasToState: () => void) => {
  const {
    canvas,
    curState,
    scale,
    offset,
    selectedCategory,
    getColor,
    inImageOI,
  } = setup();

  if (!canvas) return {};

  const drawKeypointsListeners = {
    'mouse:up': (e: fabric.IEvent<Event>) => {
      const { evt } = parseEvent(e as fabric.IEvent<MouseEvent>);
      const { x, y } = canvas.getPointer(evt);

      if (!inImageOI(x, y)) return;

      const category = selectedCategory || UNKNOWN_CATEGORY_NAME;
      const id = Math.max(-1, ...curState.map(({ id }) => id)) + 1;
      const color = getColor(category);

      const circle = new KeypointsLabel({
        keypoints: {
          points: [{ x, y, vis: true, sid: -1 }],
          structure: [],
        },
        category,
        id,
        scale,
        offset,
        coordSystem: CoordSystemType.Canvas,
      }).toCanvasObjects(color, LabelRenderMode.Drawing)[0] as fabric.Circle;
    },
  };

  const editKeypointsListeners = {};

  return {
    drawKeypointsListeners,
    editKeypointsListeners,
  };
};
