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

export const useMaskListeners = (syncCanvasToState: (id?: number) => void) => {
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
  }, [AIMode]);

  if (!canvas) return {};

  const drawMaskListeners = {
    'mouse:down': (e: fabric.IEvent<Event>) => {
      const { evt, target, button } = parseEvent(
        e as fabric.IEvent<MouseEvent>
      );

      if (!isDrawing.current) {
        if (button !== 1) return;

        const { x, y } = canvas.getPointer(evt);
        if (!inImageOI(x, y)) return;

        const category = selectedCategory || NEW_CATEGORY_NAME;
        const id = Math.max(-1, ...curState.map(({ id }) => id)) + 1;
        const color = getColor(category);

        const [polylines, lines, circles] = new MaskLabel({
          paths: [{ points: [{ x, y }], closed: false, hole: false }],
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

        let tailLine: fabric.Line | fabric.Polyline;

        if (!AIMode) {
          tailLine = new fabric.Line([x, y, x, y], {
            ...LINE_DEFAULT_CONFIG,
            stroke: color,
            selectable: false,
            hoverCursor: 'default',
          });

          isScissorMapUpdated.current = false;
        } else {
          tailLine = new fabric.Polyline(
            [
              { x, y },
              { x, y },
            ],
            {
              ...POLYLINE_DEFAULT_CONFIG,
              stroke: color,
              selectable: false,
              hoverCursor: 'default',
            }
          );

          intelligentScissor.buildMap(
            new fabric.Point((x - offset.x) / scale, (y - offset.y) / scale)
          );
          isScissorMapUpdated.current = true;
        }

        tailLine.setOptions({
          id,
          syncToLabel: false,
          polyline: polylines[0],
          bgnpoint: polylines[0].points![0],
          endpoint: null,
          tailLine: true,
        });

        circles[0][0].setOptions({
          lineStarting: tailLine,
        });

        canvas.add(...polylines, tailLine, ...circles.flat());
        isDrawing.current = true;
      } else {
        let objs = canvas.getObjects();
        let tailLine: fabric.Line | fabric.Polyline;
        tailLine = objs.find(
          (obj) =>
            (obj.type === 'line' || obj.type === 'polyline') &&
            (obj as any).tailLine
        ) as fabric.Line | fabric.Polyline;

        const { id } = tailLine as fabric.Object as LabeledObject;
        const color = tailLine.stroke;

        const { polyline } = tailLine as any as { polyline: fabric.Polyline };
        const points = polyline.points!;

        if (button === 1) {
          let x: number,
            y: number,
            point: fabric.Point,
            tailLine_: fabric.Line | fabric.Polyline;

          if (!AIMode) {
            tailLine = tailLine as fabric.Line;

            if (target && target.type === 'circle') {
              const { left, top } = target as fabric.Circle;

              // prevent adding same point continuously
              if (tailLine.x1 === left && tailLine.y1 === top) return;

              tailLine.set({
                x2: left,
                y2: top,
              });

              tailLine.setCoords();
            }

            [x, y] = [tailLine.x2!, tailLine.y2!];

            point = new fabric.Point(x, y);
            points.push(point);

            tailLine.setOptions({ tailLine: false, endpoint: point });

            tailLine_ = new fabric.Line([x, y, x, y], {
              ...LINE_DEFAULT_CONFIG,
              stroke: color,
              selectable: false,
              hoverCursor: 'default',
            });

            isScissorMapUpdated.current = false;
          } else {
            tailLine = tailLine as fabric.Polyline;

            const points_ = tailLine.points!;

            if (target && target.type === 'circle') {
              const { left, top } = target as fabric.Circle;

              // prevent adding same point continuously
              if (points_.at(0)?.x === left && points_.at(0)?.y === top) return;

              points_.pop();
              points_.push(new fabric.Point(left!, top!));

              const circle = objs.find(
                (obj) =>
                  obj.type === 'circle' &&
                  (obj as any).lineStarting === tailLine
              )!;
              const { id, polyline, bgnpoint } = tailLine as any as {
                id: number;
                polyline: fabric.Polyline;
                bgnpoint: fabric.Point;
              };

              const idx = objs.indexOf(tailLine);
              canvas.remove(tailLine);

              tailLine = new fabric.Polyline(points_, {
                ...POLYLINE_DEFAULT_CONFIG,
                stroke: color,
                selectable: false,
                hoverCursor: 'default',
              });

              tailLine.setOptions({
                id,
                syncToLabel: false,
                polyline,
                bgnpoint,
                endpoint: null,
                tailLine: true,
              });

              circle.setOptions({
                lineStarting: tailLine,
              });

              canvas.add(tailLine);
              tailLine.moveTo(idx);

              objs = canvas.getObjects();
            }

            [x, y] = [points_.at(-1)!.x, points_.at(-1)!.y];

            point = points_.at(-1)!;
            points.push(...points_.slice(1));

            tailLine.setOptions({ tailLine: false, endpoint: point });

            tailLine_ = new fabric.Polyline(
              [
                { x, y },
                { x, y },
              ],
              {
                ...POLYLINE_DEFAULT_CONFIG,
                stroke: color,
                selectable: false,
                hoverCursor: 'default',
              }
            );

            intelligentScissor.buildMap(
              new fabric.Point((x - offset.x) / scale, (y - offset.y) / scale)
            );
            isScissorMapUpdated.current = true;
          }

          const circle_ = new fabric.Circle({
            ...POINT_DEFAULT_CONFIG,
            left: x,
            top: y,
            fill: color,
            stroke: TRANSPARENT,
            selectable: false,
          });
          circle_.setOptions({
            id,
            syncToLabel: false,
            polyline,
            point,
          });

          tailLine_.setOptions({
            id,
            syncToLabel: false,
            polyline,
            bgnpoint: point,
            endpoint: null,
            tailLine: true,
          });

          circle_.setOptions({
            lineStarting: tailLine_,
            lineEnding: tailLine,
          });

          canvas.add(circle_, tailLine_);
          tailLine_.moveTo(objs.indexOf(tailLine));
        } else if (button === 3) {
        }
      }
    },

    'mouse:dblclick': (e: fabric.IEvent<Event>) => {
      const { id, polyline } = canvas.getObjects().at(-1)! as any as {
        id: number;
        polyline: fabric.Polyline;
      };

      const points = polyline.points!;

      const invalid = points.length < 2;
      if (invalid)
        canvas.remove(
          ...canvas
            .getObjects()
            .filter((obj) => (obj as LabeledObject).id === id)
        );
      else {
        const closed =
          points.at(0)?.x === points.at(-1)?.x &&
          points.at(0)?.y === points.at(-1)?.y;

        if (closed) points.pop();

        polyline.setOptions({ closed: closed && points.length > 2 });

        syncCanvasToState(id);
        setDrawType();
        selectCanvasObject(polyline as fabric.Object as LabeledObject);
      }

      isScissorMapUpdated.current = false;
      isDrawing.current = false;
    },

    'mouse:move': (e: fabric.IEvent<Event>) => {
      if (!isDrawing.current) return;

      const { evt } = parseEvent(e as fabric.IEvent<MouseEvent>);
      const { x, y } = canvas.getPointer(evt);
      const { w: canvasW, h: canvasH } = canvasInitSize!;
      const x_ = getBoundedValue(x, offset.x, canvasW - offset.x - 1);
      const y_ = getBoundedValue(y, offset.y, canvasH - offset.y - 1);

      const objs = canvas.getObjects();

      if (!AIMode) {
        const tailLine = objs.find(
          (obj) => obj.type === 'line' && (obj as any).tailLine
        ) as fabric.Line;

        tailLine.set({
          x2: x_,
          y2: y_,
        });

        tailLine.setCoords();
      } else {
        const tailLine = objs.find(
          (obj) => obj.type === 'polyline' && (obj as any).tailLine
        ) as fabric.Polyline;

        const points = calcScissorPath(
          new fabric.Point((x_ - offset.x) / scale, (y_ - offset.y) / scale)
        );

        // calcScissorPath happens in Image CoordSystem, conversion
        // back to Canvas CoordSystem can lose some precision, pin
        // the first point at exact position
        points[0] = new fabric.Point(
          tailLine.points!.at(0)!.x,
          tailLine.points!.at(0)!.y
        );

        const circle = objs.find(
          (obj) =>
            obj.type === 'circle' && (obj as any).lineStarting === tailLine
        )!;

        const tailLine_ = new fabric.Polyline(points, {
          ...POLYLINE_DEFAULT_CONFIG,
          stroke: tailLine.stroke,
          selectable: false,
          hoverCursor: 'default',
        });

        const { id, polyline, bgnpoint } = tailLine as any as {
          id: number;
          polyline: fabric.Polyline;
          bgnpoint: fabric.Point;
        };

        tailLine_.setOptions({
          id,
          syncToLabel: false,
          polyline,
          bgnpoint,
          endpoint: null,
          tailLine: true,
        });

        circle.setOptions({
          lineStarting: tailLine_,
        });

        const idx = objs.indexOf(tailLine);
        canvas.remove(tailLine).add(tailLine_);
        tailLine_.moveTo(idx);
      }

      canvas.requestRenderAll();
    },
  };

  const editMaskListeners = {
    'mouse:move': (e: fabric.IEvent<Event>) => {
      const { target } = e;

      const { switched } = trySwitchGroupRef.current(e, 'mask:edit');
      if (switched) return;
    },
  };

  return {
    drawMaskListeners,
    editMaskListeners,
  };
};
