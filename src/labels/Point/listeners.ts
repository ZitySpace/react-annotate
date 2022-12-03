import { fabric } from 'fabric';

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
    'mouse:up': (e: fabric.IEvent<Event>) => {
      const { evt } = parseEvent(e as fabric.IEvent<MouseEvent>);
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
    'mouse:down': (e: fabric.IEvent<Event>) => {
      const { target } = parseEvent(e as fabric.IEvent<MouseEvent>);
      if (!target) selectLabels([]);

      isEditing.current = true;
    },

    'mouse:up': (e: fabric.IEvent<Event>) => {
      isEditing.current = false;
    },

    'mouse:move': (e: fabric.IEvent<Event>) => {
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

    'object:modified': (e: fabric.IEvent<Event>) => {
      const { id } = e.target as LabeledObject;
      syncCanvasToState(id);
    },
  };

  return {
    drawPointListeners,
    editPointListeners,
  };
};
