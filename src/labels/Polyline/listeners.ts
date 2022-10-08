import { fabric } from 'fabric';

import { setup } from '../listeners/setup';
import { parseEvent, getBoundedValue } from '../utils';
import {
  NEW_CATEGORY_NAME,
  POINT_DEFAULT_CONFIG,
  LINE_DEFAULT_CONFIG,
  POLYLINE_DEFAULT_CONFIG,
  TRANSPARENT,
} from '../config';
import {
  CoordSystemType,
  LabelRenderMode,
  LabeledObject,
  LabelType,
} from '../Base';
import { PolylineLabel } from './label';

export const usePolylineListeners = (
  syncCanvasToState: (id?: number) => void
) => {
  const {
    canvas,
    canvasInitSize,
    curState,
    scale,
    offset,
    drawType,
    setDrawType,
    selectedCategory,
    getColor,
    isDrawing,
    isEditing,
    trySwitchGroupRef,
    refreshListenersRef,
    inImageOI,
    selectCanvasObject,
  } = setup();

  if (!canvas) return {};

  const drawPolylineListeners = {
    'mouse:down': (e: fabric.IEvent<Event>) => {
      const { evt, target, button } = parseEvent(
        e as fabric.IEvent<MouseEvent>
      );

      if (!isDrawing.current) {
        // start drawing by left click
        if (button !== 1) return;

        const { x, y } = canvas.getPointer(evt);
        if (!inImageOI(x, y)) return;

        const category = selectedCategory || NEW_CATEGORY_NAME;
        const id = Math.max(-1, ...curState.map(({ id }) => id)) + 1;
        const color = getColor(category);

        const [polylines, lines, circles] = new PolylineLabel({
          paths: [[{ x, y }]],
          category,
          id,
          scale,
          offset,
          coordSystem: CoordSystemType.Canvas,
        }).toCanvasObjects(color, LabelRenderMode.Drawing) as [
          fabric.Polyline[],
          fabric.Line[][],
          fabric.Circle[][]
        ];

        const tailLine = new fabric.Line([x, y, x, y], {
          ...LINE_DEFAULT_CONFIG,
          stroke: color,
          selectable: false,
          hoverCursor: 'default',
        });

        tailLine.setOptions({
          id,
          syncToLabel: false,
          tailLine: true,
        });

        canvas.add(...polylines, tailLine, ...circles.flat());
        isDrawing.current = true;
      } else {
        if (
          target &&
          (target.type === 'circle' ||
            (target.type === 'line' && !(target as any).tailLine))
        )
          return;

        const tailLine = canvas
          .getObjects()
          .filter(
            (obj) => obj.type === 'line' && (obj as any).tailLine
          )[0] as fabric.Line;

        const { id } = tailLine as fabric.Object as LabeledObject;
        const color = tailLine.stroke;

        const polyline = canvas
          .getObjects()
          .filter(
            (obj) => obj.type === 'polyline' && (obj as LabeledObject).id === id
          )[0] as fabric.Polyline;
        const points = polyline.points!;
        const objs = canvas.getObjects();

        if (button === 1) {
          tailLine.setOptions({ tailLine: false });
          const [x, y] = [tailLine.x2!, tailLine.y2!];

          points.push(new fabric.Point(x, y));

          const circle = new fabric.Circle({
            ...POINT_DEFAULT_CONFIG,
            left: x,
            top: y,
            fill: color,
            stroke: TRANSPARENT,
            selectable: false,
          });
          circle.setOptions({
            id,
            syncToLabel: false,
          });

          const tailLine_ = new fabric.Line([x, y, x, y], {
            ...LINE_DEFAULT_CONFIG,
            stroke: color,
            selectable: false,
            hoverCursor: 'default',
          });
          tailLine_.setOptions({
            id,
            syncToLabel: false,
            tailLine: true,
          });

          canvas.add(circle, tailLine_);
          tailLine_.moveTo(objs.indexOf(polyline) + 1);
        } else if (button === 3) {
          points.pop();

          const circle = objs.at(-1)!;

          if (!points.length) {
            canvas.remove(polyline, tailLine, circle);
            isDrawing.current = false;
          } else {
            const line = objs.at(objs.indexOf(tailLine) + 1)!;
            canvas.remove(line, circle);

            tailLine.set({
              x1: points.at(-1)?.x,
              y1: points.at(-1)?.y,
            });

            tailLine.setCoords();

            canvas.requestRenderAll();
          }
        }
      }
    },

    'mouse:dblclick': (e: fabric.IEvent<Event>) => {
      const { id } = canvas.getObjects().at(-1)! as LabeledObject;

      const polyline = canvas
        .getObjects()
        .filter(
          (obj) => obj.type === 'polyline' && (obj as LabeledObject).id === id
        )[0] as fabric.Polyline;

      const points = polyline.points!;

      const invalid = points.length < 2;
      if (invalid)
        canvas.remove(
          ...canvas
            .getObjects()
            .filter((obj) => (obj as LabeledObject).id === id)
        );
      else {
        syncCanvasToState(id);
        setDrawType();
        selectCanvasObject(polyline as fabric.Object as LabeledObject);
      }

      isDrawing.current = false;
    },

    'mouse:move': (e: fabric.IEvent<Event>) => {
      if (!isDrawing.current) return;

      const { evt } = parseEvent(e as fabric.IEvent<MouseEvent>);
      const { x, y } = canvas.getPointer(evt);
      const { w: canvasW, h: canvasH } = canvasInitSize!;
      const x_ = getBoundedValue(x, offset.x, canvasW - offset.x - 1);
      const y_ = getBoundedValue(y, offset.y, canvasH - offset.y - 1);

      const tailLine = canvas
        .getObjects()
        .filter(
          (obj) => obj.type === 'line' && (obj as any).tailLine
        )[0] as fabric.Line;

      tailLine.set({
        x2: x_,
        y2: y_,
      });

      tailLine.setCoords();

      canvas.requestRenderAll();
    },
  };

  const editPolylineListeners = {
    'mouse:move': (e: fabric.IEvent<Event>) => {
      const { switched } = trySwitchGroupRef.current(e, 'polyline:edit');
      if (switched) return;
    },

    'object:modified': (e: fabric.IEvent<Event>) => {
      const { id } = e.target as LabeledObject;
      syncCanvasToState(id);
    },
  };

  return {
    drawPolylineListeners,
    editPolylineListeners,
  };
};
