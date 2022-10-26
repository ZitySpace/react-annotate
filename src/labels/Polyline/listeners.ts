import { fabric } from 'fabric';
import { useStore } from 'zustand';
import { useRef, useEffect } from 'react';

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
import { CVStore, CVStoreProps } from '../../stores/CVStore';

export const usePolylineListeners = (
  syncCanvasToState: (id?: number) => void,
  listenerGroup: React.MutableRefObject<string>
) => {
  const {
    canvas,
    canvasInitSize,
    curState,
    setStateOpsLock,
    scale,
    offset,
    drawType,
    setDrawType,
    selectedLabels,
    selectedCategory,
    getColor,
    isDrawing,
    trySwitchGroupRef,
    refreshListenersRef,
    setListenersRef,
    inImageOI,
    selectCanvasObject,
  } = setup();

  const isDragging = useRef<boolean>(false);
  const isDeleting = useRef<boolean>(false);
  const delStart = useRef<fabric.Circle | null>(null);
  const isAdvDrawing = useRef<boolean>(false);
  const isModified = useRef<boolean>(false);

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
    if (listenerGroup.current === 'polyline:draw:advanced') {
      setListenersRef.current('default');
      setStateOpsLock(false);
    }
  }, [selectedLabels]);

  useEffect(() => {
    if (!canvas) return;

    const drawing = isDrawing.current;
    const advDrawing = isAdvDrawing.current;

    refreshListenersRef.current();

    if (
      (!drawing && !advDrawing) ||
      (drawing && drawType !== LabelType.Polyline)
    )
      return;

    isDrawing.current = drawing;
    isAdvDrawing.current = advDrawing;

    const objs = canvas.getObjects();

    const tailLine = objs.find(
      (obj) =>
        (obj.type === 'polyline' || obj.type === 'line') &&
        (obj as any).tailLine
    )!;
    const { id, polyline, bgnpoint } = tailLine as any as {
      id: number;
      polyline: fabric.Polyline;
      bgnpoint: fabric.Point;
    };
    const idx = objs.indexOf(tailLine);

    const circles = objs.filter(
      (o) => o.type === 'circle' && (o as LabeledObject).id === id
    ) as fabric.Circle[];

    const circle = circles.find(
      (c) =>
        (c as any as { lineStarting: fabric.Line | fabric.Polyline })
          .lineStarting === tailLine
    )!;

    let tailLine_: fabric.Line | fabric.Polyline;
    if (!AIMode) {
      const { stroke, points } = tailLine as fabric.Polyline;

      tailLine_ = new fabric.Line(
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
      const { stroke, x1, y1, x2, y2 } = tailLine as fabric.Line;

      if (!isScissorMapUpdated.current) {
        intelligentScissor.buildMap(
          new fabric.Point((x1! - offset.x) / scale, (y1! - offset.y) / scale)
        );
        isScissorMapUpdated.current = true;
      }

      const points = calcScissorPath(
        new fabric.Point((x2! - offset.x) / scale, (y2! - offset.y) / scale)
      );

      tailLine_ = new fabric.Polyline(points, {
        ...POLYLINE_DEFAULT_CONFIG,
        stroke,
        selectable: false,
        hoverCursor: 'default',
      });
    }

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

    canvas.remove(tailLine).add(tailLine_);
    tailLine_.moveTo(idx);
  }, [AIMode]);

  if (!canvas) return {};

  // add (from 0 points) + delete
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
        if (
          target &&
          (target.type === 'circle' ||
            (target.type === 'line' && !(target as any).tailLine))
        )
          return;

        const objs = canvas.getObjects();
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
            [x, y] = [points_!.at(-1)!.x, points_!.at(-1)!.y];

            point = points_!.at(-1)!;
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
          const circles = objs.filter(
            (o) => o.type === 'circle' && (o as LabeledObject).id === id
          ) as fabric.Circle[];

          const circle = circles.find(
            (c) =>
              (c as any as { lineStarting: fabric.Line | fabric.Polyline })
                .lineStarting === tailLine
          )!;
          const { lineEnding } = circle as any as {
            lineEnding: fabric.Line | fabric.Polyline | null;
          };

          if (!lineEnding) {
            canvas.remove(polyline, tailLine, circle);
            isDrawing.current = false;
          } else {
            if (lineEnding.type === 'line') points.pop();
            if (lineEnding.type === 'polyline')
              points.splice(
                -((lineEnding as fabric.Polyline).points!.length - 1)
              );
            canvas.remove(lineEnding, circle);

            const point_ = points.at(-1)!;
            const { x: x_, y: y_ } = point_;

            const circle_ = circles.find(
              (c) => (c as any as { point: fabric.Point }).point === point_
            )!;

            if (!AIMode) {
              tailLine = tailLine as fabric.Line;

              tailLine.set({
                x1: x_,
                y1: y_,
              });

              tailLine.setCoords();

              circle_.setOptions({
                lineStarting: tailLine,
              });

              tailLine.setOptions({
                bgnpoint: point_,
              });
            } else {
              tailLine = tailLine as fabric.Polyline;
              const { x, y } = tailLine.points!.at(-1)!;

              intelligentScissor.buildMap(
                new fabric.Point(
                  (x_ - offset.x) / scale,
                  (y_ - offset.y) / scale
                )
              );

              const points_ = calcScissorPath(
                new fabric.Point((x - offset.x) / scale, (y - offset.y) / scale)
              );

              const tailLine_ = new fabric.Polyline(points_, {
                ...POLYLINE_DEFAULT_CONFIG,
                stroke: tailLine.stroke,
                selectable: false,
                hoverCursor: 'default',
              });

              tailLine_.setOptions({
                id,
                syncToLabel: false,
                polyline,
                bgnpoint: point_,
                endpoint: null,
                tailLine: true,
              });

              circle_.setOptions({
                lineStarting: tailLine_,
              });

              const idx = objs.indexOf(tailLine);
              canvas.remove(tailLine).add(tailLine_);
              tailLine_.moveTo(idx);
            }

            canvas.requestRenderAll();
          }
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

  // drag + delete + split
  const editPolylineListeners = {
    'mouse:down': (e: fabric.IEvent<Event>) => {
      const { target, button } = parseEvent(e as fabric.IEvent<MouseEvent>);
      if (!target) return;

      if (button === 1) {
        isDragging.current = true;
      }

      if (button === 3 && target.type === 'circle') {
        isDeleting.current = true;
        delStart.current = target as fabric.Circle;
      }
    },

    'mouse:up': (e: fabric.IEvent<Event>) => {
      const { target, button } = parseEvent(e as fabric.IEvent<MouseEvent>);

      // delete point
      if (button === 3 && isDeleting.current && target?.type === 'circle') {
        const start = delStart.current!;

        const end = target as fabric.Circle;
        const { id, polyline, point } = end as any as {
          id: number;
          polyline: fabric.Polyline;
          point: fabric.Point;
        };

        const points = polyline.points!;
        const idx = points.indexOf(point);

        if (end === start) {
          points.splice(idx, 1);
          if (points.length <= 1) {
            canvas.remove(polyline);
            syncCanvasToState(id);
            setListenersRef.current('default');
            selectCanvasObject(polyline as fabric.Object as LabeledObject);
          } else {
            syncCanvasToState(id);
          }
        } else {
          const { polyline: polyline_, point: point_ } = start as any as {
            polyline: fabric.Polyline;
            point: fabric.Point;
          };

          if (polyline === polyline_) {
            const idx_ = points.indexOf(point_);

            if (
              (idx === 0 && idx_ === points.length - 1) ||
              (idx_ === 0 && idx === points.length - 1)
            )
              return;

            if (idx > idx_) {
              const points_ = points.splice(idx_ + 1);
              points_.splice(0, idx - idx_ - 1);

              const { labelType, category } = polyline as any as {
                labelType: LabelType;
                category: string;
              };

              const polyline_ = new fabric.Polyline(points_, {
                ...POLYLINE_DEFAULT_CONFIG,
                stroke: polyline.stroke,
              });
              polyline_.setOptions({
                labelType,
                category,
                id,
                syncToLabel: true,
              });
              canvas.add(polyline_);

              if (points.length <= 1) canvas.remove(polyline);
              if (points_.length <= 1) canvas.remove(polyline_);
            }

            if (idx < idx_) {
              polyline.points = points.slice(idx, idx_ + 1);
            }

            syncCanvasToState(id);
          }
        }
      }

      isDragging.current = false;
      isDeleting.current = false;
      delStart.current = null;
    },

    'mouse:move': (e: fabric.IEvent<Event>) => {
      const { target } = e;

      // remove midpoint
      if (!target || (target.type !== 'line' && target.type !== 'midpoint')) {
        const circles = canvas
          .getObjects()
          .filter((obj) => obj.type === 'midpoint');

        if (circles.length) {
          circles.forEach((c) => {
            const { line } = c as any as { line: fabric.Line };
            line.setOptions({ midpoint: null });
          });

          canvas.remove(...circles);
          canvas.requestRenderAll();
        }
      }

      if (!(isDragging.current || isDeleting.current)) {
        const { switched } = trySwitchGroupRef.current(e, 'polyline:edit');
        if (switched) return;
      }

      // show midpoint
      if (target && target.type === 'line') {
        const line = target as fabric.Line;
        const { id, labelType, midpoint } = line as any as {
          id: number;
          labelType: LabelType;
          midpoint?: fabric.Circle;
        };

        if (!midpoint) {
          const circle = new fabric.Circle({
            ...POINT_DEFAULT_CONFIG,
            left: (line.x1! + line.x2!) / 2,
            top: (line.y1! + line.y2!) / 2,
            fill: line.stroke,
            stroke: TRANSPARENT,
          });

          circle.setOptions({
            id,
            labelType,
            type: 'midpoint',
            syncToLabel: false,
            line,
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
      if (!obj || !isDragging.current) return;

      const { w: canvasW, h: canvasH } = canvasInitSize!;

      // drag endpoints
      if (obj.type === 'circle') {
        const circle = obj as fabric.Circle;

        const { lineStarting, lineEnding, point } = circle as any as {
          lineStarting: fabric.Line | null;
          lineEnding: fabric.Line | null;
          point: fabric.Point;
        };

        const { left, top } = circle;

        const x_ = getBoundedValue(left!, offset.x, canvasW - offset.x - 1);
        const y_ = getBoundedValue(top!, offset.y, canvasH - offset.y - 1);

        circle.set({
          left: x_,
          top: y_,
        });

        lineStarting &&
          lineStarting.set({
            x1: x_,
            y1: y_,
          });
        lineEnding &&
          lineEnding.set({
            x2: x_,
            y2: y_,
          });

        point.x = x_;
        point.y = y_;
      }

      // add/update midpoint
      if (obj.type === 'midpoint') {
        const circle = obj as fabric.Circle;
        let { line, lineStarting, lineEnding, point } = circle as any as {
          line: fabric.Line;
          lineStarting: fabric.Line | null;
          lineEnding: fabric.Line | null;
          point: fabric.Point | null;
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

        if (!point) {
          const { polyline, endpoint } = line as any as {
            polyline: fabric.Polyline;
            bgnpoint: fabric.Point;
            endpoint: fabric.Point;
          };

          const points = polyline.points!;
          point = new fabric.Point(circle.left!, circle.top!);
          circle.setOptions({ point });
          points.splice(points.indexOf(endpoint), 0, point);
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

        point.x = x_;
        point.y = y_;
      }

      canvas.requestRenderAll();
    },

    'mouse:dblclick': (e: fabric.IEvent<Event>) => {
      const { target } = e;

      if (!target || target.type !== 'circle') return;

      const circle = target as fabric.Circle;

      const { id, polyline, point } = circle as any as {
        id: number;
        polyline: fabric.Polyline;
        point: fabric.Point;
      };

      const points = polyline.points!;

      if (points.at(0) !== point && points.at(-1) !== point) return;

      const objs = canvas.getObjects();

      // reverse references if clicked on the head of a polyline
      if (points.at(0) === point) {
        points.reverse();

        objs
          .filter((o) => (o as LabeledObject).id === id)
          .forEach((o) => {
            if (o.type === 'polyline') return;
            const { polyline: polyline_ } = o as any as {
              polyline: fabric.Polyline;
            };
            if (polyline !== polyline_) return;

            if (o.type === 'circle') {
              const { lineStarting, lineEnding } = o as any as {
                lineStarting: fabric.Line | null;
                lineEnding: fabric.Line | null;
              };
              o.setOptions({
                lineStarting: lineEnding,
                lineEnding: lineStarting,
              });
            } else if (o.type === 'line') {
              const { bgnpoint, endpoint } = o as any as {
                bgnpoint: fabric.Point | null;
                endpoint: fabric.Point | null;
              };
              o.setOptions({
                bgnpoint: endpoint,
                endpoint: bgnpoint,
              });
            }
          });
      }

      // enter advanced drawing mode
      setListenersRef.current('polyline:draw:advanced');
      setStateOpsLock(true);

      // initialization for draw:advanced
      objs
        .filter((o) => (o as LabeledObject).id === id && o.type === 'circle')
        .forEach((o) => (o.selectable = false));

      let tailLine: fabric.Line | fabric.Polyline;
      const { x, y } = point;

      if (!AIMode) {
        tailLine = new fabric.Line([x, y, x, y], {
          ...LINE_DEFAULT_CONFIG,
          stroke: circle.fill as string,
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
            stroke: circle.fill as string,
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
        polyline,
        bgnpoint: point,
        endpoint: null,
        tailLine: true,
      });

      circle.setOptions({
        lineStarting: tailLine,
      });

      canvas.add(tailLine);
      tailLine.moveTo(
        objs.indexOf(
          objs.find((o) => (o as LabeledObject).id === id && o.type === 'line')!
        )
      );

      isAdvDrawing.current = true;
      isModified.current = false;
    },

    'object:modified': (e: fabric.IEvent<Event>) => {
      const { id } = e.target as LabeledObject;
      syncCanvasToState(id);
    },
  };

  // add + delete + merge
  const advancedDrawPolylineListeners = {
    'mouse:down': (e: fabric.IEvent<Event>) => {
      const { evt, target, button } = parseEvent(
        e as fabric.IEvent<MouseEvent>
      );

      if (
        target &&
        (target.type === 'circle' ||
          (target.type === 'line' && !(target as any).tailLine))
      )
        return;

      const objs = canvas.getObjects();
      let tailLine: fabric.Line | fabric.Polyline;
      tailLine = canvas
        .getObjects()
        .find(
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

          [x, y] = [tailLine.x2!, tailLine.y2!];

          point = new fabric.Point(x, y);
          points.push(point);
          isModified.current = true;

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
          [x, y] = [points_!.at(-1)!.x, points_!.at(-1)!.y];

          point = points_!.at(-1)!;
          points.push(...points_.slice(1));
          isModified.current = true;

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
        const circles = objs.filter(
          (o) => o.type === 'circle' && (o as LabeledObject).id === id
        ) as fabric.Circle[];

        const circle = circles.find(
          (c) =>
            (c as any as { lineStarting: fabric.Line | fabric.Polyline })
              .lineStarting === tailLine
        )!;
        const { lineEnding } = circle as any as {
          lineEnding: fabric.Line | fabric.Polyline | null;
        };

        isModified.current = true;

        if (!lineEnding) {
          canvas.remove(polyline);
          isAdvDrawing.current = false;
          syncCanvasToState(id);
          setListenersRef.current('default');
          setStateOpsLock(false);
          selectCanvasObject(polyline as fabric.Object as LabeledObject);
          isModified.current = false;
        } else {
          if (lineEnding.type === 'line') points.pop();
          if (lineEnding.type === 'polyline')
            points.splice(
              -((lineEnding as fabric.Polyline).points!.length - 1)
            );

          canvas.remove(lineEnding, circle);

          const point_ = points.at(-1)!;
          const { x: x_, y: y_ } = point_;

          const circle_ = circles.find(
            (c) => (c as any as { point: fabric.Point }).point === point_
          )!;

          if (!AIMode) {
            tailLine = tailLine as fabric.Line;

            tailLine.set({
              x1: x_,
              y1: y_,
            });

            tailLine.setCoords();

            circle_.setOptions({
              lineStarting: tailLine,
            });

            tailLine.setOptions({
              bgnpoint: point_,
            });
          } else {
            tailLine = tailLine as fabric.Polyline;
            const { x, y } = tailLine.points!.at(-1)!;

            intelligentScissor.buildMap(
              new fabric.Point((x_ - offset.x) / scale, (y_ - offset.y) / scale)
            );

            const points_ = calcScissorPath(
              new fabric.Point((x - offset.x) / scale, (y - offset.y) / scale)
            );

            const tailLine_ = new fabric.Polyline(points_, {
              ...POLYLINE_DEFAULT_CONFIG,
              stroke: tailLine.stroke,
              selectable: false,
              hoverCursor: 'default',
            });

            tailLine_.setOptions({
              id,
              syncToLabel: false,
              polyline,
              bgnpoint: point_,
              endpoint: null,
              tailLine: true,
            });

            circle_.setOptions({
              lineStarting: tailLine_,
            });

            const idx = objs.indexOf(tailLine);
            canvas.remove(tailLine).add(tailLine_);
            tailLine_.moveTo(idx);
          }

          canvas.requestRenderAll();
        }
      }
    },

    'mouse:dblclick': (e: fabric.IEvent<Event>) => {
      const { target } = e;

      const tailLine = canvas
        .getObjects()
        .find(
          (obj) =>
            (obj.type === 'line' || obj.type === 'polyline') &&
            (obj as any).tailLine
        ) as fabric.Line | fabric.Polyline;

      const { id } = tailLine as fabric.Object as LabeledObject;

      const { polyline } = tailLine as any as { polyline: fabric.Polyline };

      const points = polyline.points!;

      if (target && target.type === 'circle') {
        const { polyline: polyline_, point: point_ } = target as any as {
          polyline: fabric.Polyline;
          point: fabric.Point;
        };
        if (polyline !== polyline_) {
          const points_ = polyline_.points!;

          if (points_.at(0) === point_) {
            if (tailLine.type === 'polyline')
              points.push(
                ...(tailLine as fabric.Polyline).points!.slice(1, -1)
              );

            points.push(...points_);
            canvas.remove(polyline_);
            isModified.current = true;
          }

          if (points_.at(-1) === point_) {
            if (tailLine.type === 'polyline')
              points.push(
                ...(tailLine as fabric.Polyline).points!.slice(1, -1)
              );

            points.push(...[...points_].reverse());
            canvas.remove(polyline_);
            isModified.current = true;
          }
        }
      }

      if (points.length <= 1) canvas.remove(polyline);

      isScissorMapUpdated.current = false;
      isAdvDrawing.current = false;
      if (isModified.current) syncCanvasToState(id);
      setListenersRef.current('default');
      setStateOpsLock(false);
      selectCanvasObject(polyline as fabric.Object as LabeledObject);
      isModified.current = false;
    },

    'mouse:move': (e: fabric.IEvent<Event>) => {
      if (!isAdvDrawing.current) return;

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

  return {
    drawPolylineListeners,
    editPolylineListeners,
    advancedDrawPolylineListeners,
  };
};
