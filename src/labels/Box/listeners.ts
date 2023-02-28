import * as fabric from 'fabric';
import { TPointerEventInfo as IEvent } from 'fabric/src/EventTypeDefs';

import { setup } from '../listeners/setup';
import { parseEvent, getBoundedValue } from '../utils';
import { UNKNOWN_CATEGORY_NAME, STROKE_WIDTH } from '../config';
import { CoordSystemType, LabelRenderMode, LabeledObject } from '../Base';
import { BoxLabel } from './label';

export const useBoxListeners = (syncCanvasToState: (id?: number) => void) => {
  const {
    canvas,
    canvasInitSize,
    curState,
    scale,
    offset,
    setDrawType,
    selectedCategory,
    getColor,
    origPosition,
    isDrawing,
    isEditing,
    isObjectMoving,
    trySwitchGroupRef,
    inImageOI,
    selectCanvasObject,
  } = setup();

  if (!canvas) return {};

  const drawBoxListeners = {
    'mouse:down': (e: IEvent<MouseEvent>) => {
      if (!isDrawing.current) {
        const { evt } = parseEvent(e);
        const { x, y } = canvas.getPointer(evt);

        if (!inImageOI(x, y)) return;

        origPosition.current = new fabric.Point(x, y);

        const category = selectedCategory || UNKNOWN_CATEGORY_NAME;
        const id = Math.max(-1, ...curState.map(({ id }) => id)) + 1;
        const color = getColor(category);

        const rect = new BoxLabel({
          x,
          y,
          w: 0,
          h: 0,
          category,
          id,
          scale,
          offset,
          coordSystem: CoordSystemType.Canvas,
        }).toCanvasObjects(color, LabelRenderMode.Drawing)[0] as fabric.Rect;
        rect.set({
          hoverCursor: 'default',
        });

        canvas.add(rect);
        isDrawing.current = true;
      } else {
        const rect = canvas.getObjects().at(-1)! as fabric.Rect;
        const invalid =
          rect.width! <= STROKE_WIDTH || rect.height! <= STROKE_WIDTH;

        if (invalid) {
          canvas.remove(rect);
        } else {
          syncCanvasToState((rect as fabric.Object as LabeledObject).id);
          setDrawType();
          selectCanvasObject(rect as fabric.Object as LabeledObject);
        }

        isDrawing.current = false;
      }
    },

    'mouse:move': (e: IEvent<MouseEvent>) => {
      if (!isDrawing.current) return;

      const { evt } = parseEvent(e);
      const { x, y } = canvas.getPointer(evt);
      const { x: origX, y: origY } = origPosition.current;
      const { w: canvasW, h: canvasH } = canvasInitSize!;

      const x_ = Math.max(offset.x, x < origX ? x : origX);
      const x2_ = Math.min(canvasW - offset.x - 1, x > origX ? x : origX);
      const y_ = Math.max(offset.y, y < origY ? y : origY);
      const y2_ = Math.min(canvasH - offset.y - 1, y > origY ? y : origY);

      const rect = canvas.getObjects().at(-1)! as fabric.Rect;
      rect.set({
        left: x_ - STROKE_WIDTH / 2,
        top: y_ - STROKE_WIDTH / 2,
        width: x2_ - x_,
        height: y2_ - y_,
      });

      canvas.requestRenderAll();
    },
  };

  const editBoxListeners = {
    'mouse:down': (e: IEvent<MouseEvent>) => {
      isEditing.current = true;
    },

    'mouse:up': (e: IEvent<MouseEvent>) => {
      isEditing.current = false;
      isObjectMoving.current = false;
    },

    'mouse:move': (e: IEvent<MouseEvent>) => {
      const { switched } = trySwitchGroupRef.current(e, 'box:edit');
      if (switched) return;

      const rect = canvas.getActiveObject() as fabric.Rect;
      if (!rect || !isEditing.current) return;

      const { w: canvasW, h: canvasH } = canvasInitSize!;

      const { left, top } = rect;
      const x = left! + STROKE_WIDTH / 2;
      const y = top! + STROKE_WIDTH / 2;
      const w = rect.getScaledWidth() - STROKE_WIDTH;
      const h = rect.getScaledHeight() - STROKE_WIDTH;
      const x2 = x + w;
      const y2 = y + h;

      if (isObjectMoving.current) {
        const x_ = getBoundedValue(x, offset.x, canvasW - offset.x - 1 - w!);
        const y_ = getBoundedValue(y, offset.y, canvasH - offset.y - 1 - h!);
        if (x === x_ && y === y_) return;

        rect.set({
          left: x_ - STROKE_WIDTH / 2,
          top: y_ - STROKE_WIDTH / 2,
        });
      } else {
        const minGap = 2 * STROKE_WIDTH;
        const x_ = getBoundedValue(
          x,
          offset.x,
          canvasW - offset.x - 1 - minGap
        );
        const y_ = getBoundedValue(
          y,
          offset.y,
          canvasH - offset.y - 1 - minGap
        );
        const x2_ = getBoundedValue(
          x2,
          offset.x + minGap,
          canvasW - offset.x - 1
        );
        const y2_ = getBoundedValue(
          y2,
          offset.y + minGap,
          canvasH - offset.y - 1
        );

        if (x === x_ && y === y_ && x2 === x2_ && y2 === y2_) return;

        // has to update scaleX/Y as well to set width/height correctly !!!
        rect.set({
          left: x_ - STROKE_WIDTH / 2,
          top: y_ - STROKE_WIDTH / 2,
          width: x2_ - x_,
          height: y2_ - y_,
          scaleX: 1,
          scaleY: 1,
        });
      }

      canvas.requestRenderAll();
    },

    'object:moving': (e: IEvent<MouseEvent>) => {
      isObjectMoving.current = true;
    },

    'object:modified': (e: IEvent<MouseEvent>) => {
      // since fabricV6, canvas.remove() in syncStateToCanvas
      // will trigger object:modified, but with e.e undefined
      if (!e.e) return;

      const { id } = e.target as LabeledObject;
      syncCanvasToState(id);
    },
  };

  return {
    drawBoxListeners,
    editBoxListeners,
  };
};
