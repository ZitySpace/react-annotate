import * as fabric from '@zityspace/fabric';
import { TPointerEventInfo as IEvent } from '@zityspace/fabric/src/EventTypeDefs';

import { setup } from '../listeners/setup';
import { parseEvent, getBoundedValue } from '../utils';
import { UNKNOWN_CATEGORY_NAME } from '../config';
import { CoordSystemType, LabelRenderMode, LabeledObject } from '../Base';
import { PointLabel } from './label';

export const usePointListeners = (syncCanvasToState: (id?: number) => void) => {
  const {
    canvas,
    canvasInitSize,
    curState,
    scale,
    offset,
    setDrawType,
    selectLabels,
    selectedCategory,
    getColor,
    isEditing,
    trySwitchGroupRef,
    inImageOI,
    selectCanvasObject,
  } = setup();

  if (!canvas) return {};

  const drawPointListeners = {
    'mouse:up': (e: IEvent<MouseEvent>) => {
      const { evt } = parseEvent(e);
      const { x, y } = canvas.getPointer(evt);

      if (!inImageOI(x, y)) return;

      const category = selectedCategory || UNKNOWN_CATEGORY_NAME;
      const id = Math.max(-1, ...curState.map(({ id }) => id)) + 1;
      const color = getColor(category);

      const circle = new PointLabel({
        x,
        y,
        category,
        id,
        scale,
        offset,
        coordSystem: CoordSystemType.Canvas,
      }).toCanvasObjects(color, LabelRenderMode.Drawing)[0] as fabric.Circle;

      canvas.add(circle);

      syncCanvasToState((circle as fabric.Object as LabeledObject).id);
      setDrawType();
      selectCanvasObject(circle as fabric.Object as LabeledObject);
    },
  };

  const editPointListeners = {
    'mouse:down': (e: IEvent<MouseEvent>) => {
      const { target } = parseEvent(e);
      if (!target) selectLabels([]);

      isEditing.current = true;
    },

    'mouse:up': (e: IEvent<MouseEvent>) => {
      isEditing.current = false;
    },

    'mouse:move': (e: IEvent<MouseEvent>) => {
      const { switched } = trySwitchGroupRef.current(e, 'point:edit');
      if (switched) return;

      const circle = canvas.getActiveObject() as fabric.Circle;
      if (!circle || !isEditing.current) return;

      const { w: canvasW, h: canvasH } = canvasInitSize!;
      const { left, top } = circle;

      circle.set({
        left: getBoundedValue(left!, offset.x, canvasW - offset.x - 1),
        top: getBoundedValue(top!, offset.y, canvasH - offset.y - 1),
      });

      canvas.requestRenderAll();
    },

    'object:modified': (e: IEvent<MouseEvent>) => {
      if (!e.e) return;

      const { id } = e.target as LabeledObject;
      syncCanvasToState(id);
    },
  };

  return {
    drawPointListeners,
    editPointListeners,
  };
};
