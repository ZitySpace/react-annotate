import { fabric } from 'fabric';
import { useStore } from 'zustand';
import { useEffect, useRef } from 'react';

import { setup } from '../listeners/setup';
import { CVStore, CVStoreProps } from '../../stores/CVStore';
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
import { MaskLabel } from './label';

export const useMaskListeners = (syncCanvasToState: () => void) => {
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

  const isScissorMapUpdated = useRef<boolean>(false);

  const cv = window['cv'];
  const { intelligentScissor, AIMode } = useStore(
    CVStore,
    (s: CVStoreProps) => s
  );

  const calcScissorPath = (point: fabric.Point) => {
    const contour = new cv.Mat();
    intelligentScissor.getContour(point, contour);
    cv.approxPolyDP(
      contour,
      contour,
      0.015 * cv.arcLength(contour, false),
      false
    );

    const points_: number[] = Array.from(contour.data32S);

    const points = Array.from(
      { length: points_.length / 2 },
      (_, i) =>
        new fabric.Point(
          points_[2 * i] * scale + offset.x,
          points_[2 * i + 1] * scale + offset.y
        )
    );

    contour.delete();
    return points;
  };

  useEffect(() => {
    if (!canvas) return;

    if (drawType === LabelType.Mask) {
      const drawing = isDrawing.current;
      refreshListenersRef.current();

      if (!drawing) return;

      isDrawing.current = true;

      const line = canvas
        .getObjects()
        .filter(
          (obj) =>
            (obj.type === 'polyline' || obj.type === 'line') &&
            (obj as any).tailLine
        )[0];
      const { id } = line as LabeledObject;
      const idx = canvas.getObjects().indexOf(line);

      let newLine: fabric.Line | fabric.Polyline;
      if (!AIMode) {
        const { stroke, points } = line as fabric.Polyline;

        newLine = new fabric.Line(
          [
            points!.at(0)!.x,
            points!.at(0)!.y,
            points!.at(-1)!.x,
            points!.at(-1)!.y,
          ],
          {
            ...LINE_DEFAULT_CONFIG,
            stroke,
            selectable: false,
            hoverCursor: 'default',
          }
        );
      } else {
        const { stroke, x1, y1, x2, y2 } = line as fabric.Line;

        if (!isScissorMapUpdated.current) {
          intelligentScissor.buildMap(
            new fabric.Point((x1! - offset.x) / scale, (y1! - offset.y) / scale)
          );
          isScissorMapUpdated.current = true;
        }

        const points = calcScissorPath(
          new fabric.Point((x2! - offset.x) / scale, (y2! - offset.y) / scale)
        );

        newLine = new fabric.Polyline(points, {
          ...POLYLINE_DEFAULT_CONFIG,
          stroke,
          fill: TRANSPARENT,
          selectable: false,
          hoverCursor: 'default',
        });
      }

      newLine.setOptions({
        id,
        syncToLabel: false,
        tailLine: true,
      });

      canvas.remove(line).add(newLine);
      newLine.moveTo(idx);

      canvas.requestRenderAll();
    }
  }, [AIMode]);

  if (!canvas) return {};

  const drawMaskListeners = {
    /*
    'mouse:down': (e: fabric.IEvent<Event>) => {
      const { evt, target } = parseEvent(e as fabric.IEvent<MouseEvent>);

      if (!isDrawing.current) {
        const { x, y } = canvas.getPointer(evt);
        if (!inImageOI(x, y)) return;

        const category = selectedCategory || NEW_CATEGORY_NAME;
        const id = Math.max(-1, ...curState.map(({ id }) => id)) + 1;
        const color = getColor(category);

        const objs = new MaskLabel({
          points: [{ x, y }],
          category,
          id,
          scale,
          offset,
          coordSystem: CoordSystemType.Canvas,
        }).toCanvasObjects(color, LabelRenderMode.Drawing);

        const circle = objs.pop() as fabric.Circle;
        const polygon = objs.pop() as fabric.Polygon;

        let line: fabric.Line | fabric.Polyline;

        if (!AIMode) {
          line = new fabric.Line([x, y, x, y], {
            ...LINE_DEFAULT_CONFIG,
            stroke: color,
            selectable: false,
            hoverCursor: 'default',
          });

          isScissorMapUpdated.current = false;
        } else {
          line = new fabric.Polyline(
            [
              { x, y },
              { x, y },
            ],
            {
              ...POLYLINE_DEFAULT_CONFIG,
              stroke: color,
              fill: TRANSPARENT,
              selectable: false,
              hoverCursor: 'default',
            }
          );

          intelligentScissor.buildMap(
            new fabric.Point((x - offset.x) / scale, (y - offset.y) / scale)
          );
          isScissorMapUpdated.current = true;
        }

        line.setOptions({
          id,
          syncToLabel: false,
          tailLine: true,
        });
        canvas.add(polygon, circle, line);
        line.moveTo(canvas.getObjects().indexOf(polygon) + 1);

        isDrawing.current = true;
      } else {
        // add another point
        if (!target || target.type === 'line' || target.type === 'polyline') {
          let line_;
          if (!target)
            line_ = canvas
              .getObjects()
              .filter(
                (obj) =>
                  (obj.type === 'line' || obj.type === 'polyline') &&
                  (obj as any).tailLine
              )[0];
          else line_ = target;

          if (!(line_ as any).tailLine) return;
          line_.setOptions({ tailLine: false });

          if (!AIMode) {
            line_ = line_ as fabric.Line;
            const [x, y] = [line_.x2!, line_.y2!];

            const { id } = canvas.getObjects().at(-1) as LabeledObject;
            const polygon = canvas
              .getObjects()
              .filter(
                (obj) =>
                  obj.type === 'polygon' && (obj as LabeledObject).id === id
              )[0] as fabric.Polygon;
            const color = line_.stroke!;

            const points = polygon.points!;
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
              pidOfPolygon: points.length - 1,
              syncToLabel: false,
            });

            const line = new fabric.Line([x, y, x, y], {
              ...LINE_DEFAULT_CONFIG,
              stroke: color,
              selectable: false,
              hoverCursor: 'default',
            });
            line.setOptions({ id, syncToLabel: false, tailLine: true });

            canvas.add(circle, line);
            line.moveTo(canvas.getObjects().indexOf(polygon) + 1);

            isScissorMapUpdated.current = false;
          } else {
            line_ = line_ as fabric.Polyline;
            const points_ = line_.points!;
            const [x, y] = [points_!.at(-1)!.x, points_!.at(-1)!.y];

            const { id } = canvas.getObjects().at(-1) as LabeledObject;
            const polygon = canvas
              .getObjects()
              .filter(
                (obj) =>
                  obj.type === 'polygon' && (obj as LabeledObject).id === id
              )[0] as fabric.Polygon;
            const color = line_.stroke!;

            const points = polygon.points!;
            points.push(...points_.slice(1));

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
              pidOfPolygon: points.length - 1,
              syncToLabel: false,
            });

            const line = new fabric.Polyline(
              [
                { x, y },
                { x, y },
              ],
              {
                ...POLYLINE_DEFAULT_CONFIG,
                stroke: color,
                fill: TRANSPARENT,
                selectable: false,
                hoverCursor: 'default',
              }
            );
            line.setOptions({ id, syncToLabel: false, tailLine: true });

            canvas.add(circle, line);
            line.moveTo(canvas.getObjects().indexOf(polygon) + 1);

            intelligentScissor.buildMap(
              new fabric.Point((x - offset.x) / scale, (y - offset.y) / scale)
            );
            isScissorMapUpdated.current = true;
          }
        }

        // close the polygon
        if (target && target.type === 'circle') {
          const circle = target as fabric.Circle;
          const { id, pidOfPolygon } = circle as any as {
            id: number;
            pidOfPolygon: number;
          };
          if (pidOfPolygon) return;

          const polygon = canvas
            .getObjects()
            .filter(
              (obj) =>
                obj.type === 'polygon' && (obj as LabeledObject).id === id
            )[0] as fabric.Polygon;

          const points = polygon.points!;

          if (AIMode) {
            const line = canvas
              .getObjects()
              .filter(
                (obj) => obj.type === 'polyline' && (obj as any).tailLine
              )[0] as fabric.Polyline;

            const points_ = line.points!;
            points.push(...points_.slice(1, -1));
          }

          const invalid = points.length < 3;
          if (invalid) {
            canvas.remove(
              ...canvas
                .getObjects()
                .filter((obj) => (obj as LabeledObject).id === id)
            );
          } else {
            if (AIMode) isScissorMapUpdated.current = false;

            syncCanvasToState();
            setDrawType();
            selectCanvasObject(polygon as fabric.Object as LabeledObject);
          }

          isDrawing.current = false;
        }
      }
    },

    'mouse:move': (e: fabric.IEvent<Event>) => {
      if (!isDrawing.current) return;

      const { evt } = parseEvent(e as fabric.IEvent<MouseEvent>);
      const { x, y } = canvas.getPointer(evt);
      const { w: canvasW, h: canvasH } = canvasInitSize!;
      const x_ = getBoundedValue(x, offset.x, canvasW - offset.x - 1);
      const y_ = getBoundedValue(y, offset.y, canvasH - offset.y - 1);

      let line: fabric.Line | fabric.Polyline;
      if (!AIMode) {
        line = canvas
          .getObjects()
          .filter(
            (obj) => obj.type === 'line' && (obj as any).tailLine
          )[0] as fabric.Line;

        line.set({
          x2: x_,
          y2: y_,
        });

        line.setCoords();
      } else {
        line = canvas
          .getObjects()
          .filter(
            (obj) => obj.type === 'polyline' && (obj as any).tailLine
          )[0] as fabric.Polyline;

        const points = calcScissorPath(
          new fabric.Point((x_ - offset.x) / scale, (y_ - offset.y) / scale)
        );

        const newLine = new fabric.Polyline(points, {
          ...POLYLINE_DEFAULT_CONFIG,
          stroke: line.stroke,
          fill: TRANSPARENT,
          selectable: false,
          hoverCursor: 'default',
        });

        newLine.setOptions({
          id: (line as fabric.Object as LabeledObject).id,
          syncToLabel: false,
          tailLine: true,
        });

        const idx = canvas.getObjects().indexOf(line);
        canvas.remove(line).add(newLine);
        newLine.moveTo(idx);
      }

      canvas.requestRenderAll();
    },
    */
  };

  const editMaskListeners = {
    /*
    'mouse:down': (e: fabric.IEvent<Event>) => {
      const { target, button } = parseEvent(e as fabric.IEvent<MouseEvent>);
      if (!target) return;

      if (button === 1) {
        isEditing.current = true;
      }

      // delete point
      if (button === 3) {
        if (target.type !== 'circle') return;

        const circle = target as fabric.Circle;
        const { id, pidOfPolygon } = circle as any as {
          id: number;
          pidOfPolygon: number;
        };

        const polygon = canvas
          .getObjects()
          .filter(
            (obj) => obj.type === 'polygon' && (obj as LabeledObject).id === id
          )[0] as fabric.Polygon;

        const points = polygon.points!;

        if (points.length < 4) return;

        points.splice(pidOfPolygon, 1);
        syncCanvasToState();
      }
    },

    'mouse:up': (e: fabric.IEvent<Event>) => {
      isEditing.current = false;
    },

    'mouse:move': (e: fabric.IEvent<Event>) => {
      const { target } = e;

      // remove midpoint
      if (!target || (target.type !== 'line' && target.type !== 'midpoint')) {
        const circles = canvas
          .getObjects()
          .filter((obj) => obj.type === 'midpoint');

        if (circles.length) {
          const lines = circles.map(
            (c) => (c as any as { line: fabric.Line }).line
          );

          lines.forEach((l) =>
            l.setOptions({
              midpoint: null,
            })
          );

          canvas.remove(...circles);
          canvas.requestRenderAll();
        }
      }

      const { switched } = trySwitchGroupRef.current(e, 'mask:edit');
      if (switched) return;

      // show midpoint
      if (target && target.type === 'line') {
        const line = target as fabric.Line;
        const { labelType, midpoint } = line as any;

        if (!midpoint) {
          const circle = new fabric.Circle({
            ...POINT_DEFAULT_CONFIG,
            left: (line.x1! + line.x2!) / 2,
            top: (line.y1! + line.y2!) / 2,
            fill: line.stroke,
            stroke: TRANSPARENT,
          });

          circle.setOptions({
            labelType,
            line,
            lineStarting: null,
            lineEnding: null,
            pointOfPolygon: null,
            type: 'midpoint',
            syncToLabel: false,
          });

          line.setOptions({
            midpoint: circle,
          });

          canvas.add(circle);
          canvas.requestRenderAll();
        }

        return;
      }

      const obj = canvas.getActiveObject();
      if (!obj || !isEditing.current) return;

      const { w: canvasW, h: canvasH } = canvasInitSize!;

      if (obj.type === 'circle') {
        const circle = obj as fabric.Circle;
        const { lineStarting, lineEnding, pointOfPolygon } = circle as any as {
          lineStarting: fabric.Line;
          lineEnding: fabric.Line;
          pointOfPolygon: fabric.Point;
        };

        const { left, top } = circle;

        const x_ = getBoundedValue(left!, offset.x, canvasW - offset.x - 1);
        const y_ = getBoundedValue(top!, offset.y, canvasH - offset.y - 1);

        circle.set({
          left: x_,
          top: y_,
        });

        lineStarting.set({
          x1: x_,
          y1: y_,
        });
        lineEnding.set({
          x2: x_,
          y2: y_,
        });

        pointOfPolygon.x = x_;
        pointOfPolygon.y = y_;
      }

      // add/update midpoint
      if (obj.type === 'midpoint') {
        const circle = obj as fabric.Circle;
        let { line, lineStarting, lineEnding, pointOfPolygon } =
          circle as any as {
            line: fabric.Line;
            lineStarting: fabric.Line | null;
            lineEnding: fabric.Line | null;
            pointOfPolygon: fabric.Point | null;
          };

        const { left, top } = circle;

        const x_ = getBoundedValue(left!, offset.x, canvasW - offset.x - 1);
        const y_ = getBoundedValue(top!, offset.y, canvasH - offset.y - 1);

        line.visible = false;

        if (!lineStarting) {
          lineStarting = new fabric.Line([x_, y_, line.x2!, line.y2!], {
            ...LINE_DEFAULT_CONFIG,
            stroke: line.stroke,
          });
          circle.setOptions({ lineStarting });
          canvas.add(lineStarting);
        }

        if (!lineEnding) {
          lineEnding = new fabric.Line([line.x1!, line.y1!, x_, y_], {
            ...LINE_DEFAULT_CONFIG,
            stroke: line.stroke,
          });
          circle.setOptions({ lineEnding });
          canvas.add(lineEnding);
        }

        if (!pointOfPolygon) {
          const {
            id,
            pidsOfPolygon: [pid1, pid2],
          } = line as any as { id: number; pidsOfPolygon: [number, number] };

          const polygon = canvas
            .getObjects()
            .filter(
              (obj) =>
                obj.type === 'polygon' && (obj as LabeledObject).id === id
            )[0] as fabric.Polygon;

          const points = polygon.points!;

          pointOfPolygon = new fabric.Point(circle.left!, circle.top!);
          circle.setOptions({ pointOfPolygon });
          points.splice(pid2, 0, pointOfPolygon);
        }

        circle.set({
          left: x_,
          top: y_,
        });

        lineStarting.set({
          x1: x_,
          y1: y_,
        });
        lineEnding.set({
          x2: x_,
          y2: y_,
        });

        pointOfPolygon.x = x_;
        pointOfPolygon.y = y_;
      }

      canvas.requestRenderAll();
    },

    'object:modified': (e: fabric.IEvent<Event>) => {
      syncCanvasToState();
    },
    */
  };

  return {
    drawMaskListeners,
    editMaskListeners,
  };
};
