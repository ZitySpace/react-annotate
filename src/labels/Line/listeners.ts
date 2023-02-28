import * as fabric from 'fabric';
import { TPointerEventInfo as IEvent } from 'fabric/src/EventTypeDefs';

import { setup } from '../listeners/setup';
import { parseEvent, getBoundedValue } from '../utils';
import { UNKNOWN_CATEGORY_NAME, STROKE_WIDTH } from '../config';
import { CoordSystemType, LabelRenderMode, LabeledObject } from '../Base';
import { LineLabel } from './label';

export const useLineListeners = (syncCanvasToState: (id?: number) => void) => {
  const {
    canvas,
    canvasInitSize,
    curState,
    scale,
    offset,
    setDrawType,
    selectedCategory,
    getColor,
    isDrawing,
    isEditing,
    trySwitchGroupRef,
    inImageOI,
    selectCanvasObject,
  } = setup();

  if (!canvas) return {};

  const drawLineListeners = {
    'mouse:down': (e: IEvent<MouseEvent>) => {
      if (!isDrawing.current) {
        const { evt } = parseEvent(e);
        const { x, y } = canvas.getPointer(evt);

        if (!inImageOI(x, y)) return;

        const category = selectedCategory || UNKNOWN_CATEGORY_NAME;
        const id = Math.max(-1, ...curState.map(({ id }) => id)) + 1;
        const color = getColor(category);

        const line = new LineLabel({
          x1: x,
          y1: y,
          x2: x,
          y2: y,
          category,
          id,
          scale,
          offset,
          coordSystem: CoordSystemType.Canvas,
        }).toCanvasObjects(color, LabelRenderMode.Drawing)[0] as fabric.Line;
        line.set({
          hoverCursor: 'default',
        });

        canvas.add(line);
        isDrawing.current = true;
      } else {
        const line = canvas.getObjects().at(-1)! as fabric.Line;
        const invalid =
          line.width! <= STROKE_WIDTH && line.height! <= STROKE_WIDTH;

        if (invalid) {
          canvas.remove(line);
        } else {
          syncCanvasToState((line as fabric.Object as LabeledObject).id);
          setDrawType();
          selectCanvasObject(line as fabric.Object as LabeledObject);
        }

        isDrawing.current = false;
      }
    },

    'mouse:move': (e: IEvent<MouseEvent>) => {
      if (!isDrawing.current) return;

      const { evt } = parseEvent(e);
      const { x, y } = canvas.getPointer(evt);
      const { w: canvasW, h: canvasH } = canvasInitSize!;

      const line = canvas.getObjects().at(-1)! as fabric.Line;

      line.set({
        x2: getBoundedValue(x, offset.x, canvasW - offset.x - 1),
        y2: getBoundedValue(y, offset.y, canvasH - offset.y - 1),
      });

      canvas.requestRenderAll();
    },
  };

  const editLineListeners = {
    'mouse:down': (e: IEvent<MouseEvent>) => {
      isEditing.current = true;
    },

    'mouse:up': (e: IEvent<MouseEvent>) => {
      isEditing.current = false;
    },

    'mouse:move': (e: IEvent<MouseEvent>) => {
      const { switched } = trySwitchGroupRef.current(e, 'line:edit');
      if (switched) return;

      const obj = canvas.getActiveObject();
      if (!obj || !isEditing.current) return;

      const { w: canvasW, h: canvasH } = canvasInitSize!;

      if (obj.type === 'line') {
        const line = obj as fabric.Line;
        const [circle1, circle2] = (line as any).endpoints as [
          fabric.Circle,
          fabric.Circle
        ];

        const { x1, y1, x2, y2, left, top } = line;

        // assume originX/Y = center
        const x1_ = left! + (x1! - x2!) / 2;
        const y1_ = top! + (y1! - y2!) / 2;
        const x2_ = left! + (x2! - x1!) / 2;
        const y2_ = top! + (y2! - y1!) / 2;

        const l = Math.min(x1_, x2_);
        const r = Math.max(x1_, x2_);
        const translateX =
          l < offset.x
            ? offset.x - l
            : r > canvasW - offset.x - 1
            ? canvasW - offset.x - 1 - r
            : 0;

        const t = Math.min(y1_, y2_);
        const b = Math.max(y1_, y2_);
        const translateY =
          t < offset.y
            ? offset.y - t
            : b > canvasH - offset.y - 1
            ? canvasH - offset.y - 1 - b
            : 0;

        line.set({
          x1: x1_ + translateX,
          y1: y1_ + translateY,
          x2: x2_ + translateX,
          y2: y2_ + translateY,
        });

        circle1.set({
          left: x1_ + translateX,
          top: y1_ + translateY,
        });

        circle2.set({
          left: x2_ + translateX,
          top: y2_ + translateY,
        });
      } else {
        const circle = obj as fabric.Circle;
        const { line, endpointOfLine } = circle as any as {
          line: fabric.Line;
          endpointOfLine: number;
        };

        const { left, top } = circle;

        const x_ = getBoundedValue(left!, offset.x, canvasW - offset.x - 1);
        const y_ = getBoundedValue(top!, offset.y, canvasH - offset.y - 1);

        circle.set({
          left: x_,
          top: y_,
        });

        line.set(
          endpointOfLine === 1
            ? {
                x1: x_,
                y1: y_,
              }
            : {
                x2: x_,
                y2: y_,
              }
        );
      }

      canvas.requestRenderAll();
    },

    'object:modified': (e: IEvent<MouseEvent>) => {
      if (!e.e) return;

      const { id } = e.target as LabeledObject;
      syncCanvasToState(id);
    },
  };

  return {
    drawLineListeners,
    editLineListeners,
  };
};
