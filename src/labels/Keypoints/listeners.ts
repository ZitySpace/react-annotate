import { fabric } from 'fabric';

import { setup } from '../listeners/setup';
import { parseEvent, getBoundedValue } from '../utils';
import { CoordSystemType, LabelRenderMode, LabeledObject } from '../Base';
import { KeypointsLabel } from './label';

export const useKeypointsListeners = (syncCanvasToState: () => void) => {
  const drawKeypointsListeners = {};

  const editKeypointsListeners = {};

  return {
    drawKeypointsListeners,
    editKeypointsListeners,
  };
};
