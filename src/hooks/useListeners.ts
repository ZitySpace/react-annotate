import { fabric } from 'fabric';
import { useStore } from 'zustand';
import { useEffect, useRef } from 'react';
import {
  CanvasMetaStore,
  CanvasMetaStoreProps,
} from '../stores/CanvasMetaStore';
import { CanvasStore, CanvasStoreProps } from '../stores/CanvasStore';
import { ImageMetaStore, ImageMetaStoreProps } from '../stores/ImageMetaStore';
import { SelectionStore, SelectionStoreProps } from '../stores/SelectionStore';
import { ColorStore, ColorStoreProps } from '../stores/ColorStore';
import {
  LabeledObject,
  LabelType,
  newLabelFromCanvasObject,
  BoxLabel,
  PointLabel,
  LineLabel,
  LabelRenderMode,
  MaskLabel,
} from '../labels';
import { getBetween } from '../utils';
import {
  LINE_DEFAULT_CONFIG,
  NEW_CATEGORY_NAME,
  POINT_DEFAULT_CONFIG,
  RADIUS,
  STROKE_WIDTH,
  TRANSPARENT,
} from '../interfaces/config';
import { CoordSystemType } from '../labels/BaseLabel';

function parseEvent<T extends MouseEvent | WheelEvent>(e: fabric.IEvent<T>) {
  const { button, target, pointer, e: evt } = e;
  evt.preventDefault();
  evt.stopPropagation();

  return { button, target, pointer, evt };
}

export const useListeners = (syncCanvasToState: () => void) => {
  const { canvas, initSize: canvasInitSize } = useStore(
    CanvasMetaStore,
    (s: CanvasMetaStoreProps) => s
  );

  const curState = useStore(CanvasStore, (s: CanvasStoreProps) => s.curState());

  const {
    size: imageSize,
    scale,
    offset,
  } = useStore(ImageMetaStore, (s: ImageMetaStoreProps) => s);

  const {
    drawType,
    setDrawType,
    labels: selectedLabels,
    selectLabels,
    category: selectedCategory,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  const getColor = useStore(ColorStore, (s: ColorStoreProps) => s.getColor);

  // lastPosition is relative mouse coords on the viewport,
  // e.g. top-left is always (0,0)
  const lastPosition = useRef<fabric.Point>(new fabric.Point(0, 0));
  // origPosition is absolute coords on the canvas,
  // e.g. top-left of image is always (offset.x, offset.y)
  const origPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanning = useRef<boolean>(false);
  const isDrawing = useRef<boolean>(false);
  const isEditing = useRef<boolean>(false);
  const isObjectMoving = useRef<boolean>(false);
  const listenerGroup = useRef<string>('default');

  useEffect(() => {
    if (!canvas) return;
    refreshListeners();
  }, [selectedLabels]);

  useEffect(() => {
    if (!canvas) return;

    const group = drawType === LabelType.None ? 'default' : drawType + ':draw';
    setListeners(group);
  }, [drawType]);

  if (!canvas) return () => {};

  const setZoomByWheel = (evt: WheelEvent) => {
    const { deltaY, offsetX: x, offsetY: y } = evt;

    // make touchBoard more smooth, using ctrlKey to identify touchBoard
    // more detail in: https://use-gesture.netlify.app/docs/options/#modifierkey
    const delta = deltaY * (evt.ctrlKey ? 3 : 1);
    const zoom = getBetween(canvas.getZoom() * 0.999 ** delta, 0.01, 20);
    canvas.zoomToPoint({ x, y }, zoom);
  };

  const setViewport = (x: number = 0, y: number = 0) => {
    const zoom = canvas.getZoom();
    const [w, h] = [canvas.width!, canvas.height!];
    const vpt = canvas.viewportTransform as number[];
    const offsetX = w - canvasInitSize!.w * zoom;
    const offsetY = h - canvasInitSize!.h * zoom;
    vpt[4] = offsetX > 0 ? offsetX / 2 : getBetween(vpt[4] + x, offsetX, 0);
    vpt[5] = offsetY > 0 ? offsetY / 2 : getBetween(vpt[5] + y, offsetY, 0);
    canvas.requestRenderAll();
  };

  const selectCanvasObject = (obj: LabeledObject) => {
    const label = newLabelFromCanvasObject({
      obj,
      scale,
      offset,
    })!;
    selectLabels([label]);
  };

  const sharedListeners = {
    'selection:created': (e: fabric.IEvent<Event>) => {
      if (e.e && selectedLabels.length !== 1) {
        selectCanvasObject((e as any).selected[0]);
      }
    },

    'selection:cleared': (e: fabric.IEvent<Event>) => {
      e.e && selectLabels([]);
    },

    'mouse:wheel': (e: fabric.IEvent<Event>) => {
      const { evt } = parseEvent(e as fabric.IEvent<WheelEvent>);

      setZoomByWheel(evt);
      setViewport();
    },
  };

  const defaultListeners = {
    'mouse:down': (e: fabric.IEvent<Event>) => {
      const { pointer } = parseEvent(e as fabric.IEvent<MouseEvent>);

      isPanning.current = true;
      lastPosition.current = pointer!;
      canvas.setCursor('grabbing');
      selectLabels([]);
    },

    'mouse:move': (e: fabric.IEvent<Event>) => {
      const { pointer, switched } = trySwitchGroup(e, 'default');
      if (switched) return;

      if (!isPanning.current) return;

      setViewport(
        pointer!.x - lastPosition.current.x,
        pointer!.y - lastPosition.current.y
      );
      canvas.setViewportTransform(canvas.viewportTransform as number[]);
      lastPosition.current = pointer!;
      canvas.setCursor('grabbing');
    },

    'mouse:up': (e: fabric.IEvent<Event>) => {
      isPanning.current = false;
      canvas.setCursor('default');
    },
  };

  const inImageOI = (x: number, y: number) =>
    x >= offset.x &&
    y >= offset.y &&
    x + offset.x < canvasInitSize!.w &&
    y + offset.y < canvasInitSize!.h;

  const drawBoxListeners = {
    'mouse:down': (e: fabric.IEvent<Event>) => {
      if (!isDrawing.current) {
        const { evt } = parseEvent(e as fabric.IEvent<MouseEvent>);
        const { x, y } = canvas.getPointer(evt);

        if (!inImageOI(x, y)) return;

        origPosition.current = { x, y };

        const category = selectedCategory || NEW_CATEGORY_NAME;
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
        }).toCanvasObjects(color, LabelRenderMode.Drawing)[0];

        canvas.add(rect);
        isDrawing.current = true;
      } else {
        const rect = canvas.getObjects().at(-1)! as fabric.Rect;
        const invalid =
          rect.width! <= STROKE_WIDTH || rect.height! <= STROKE_WIDTH;

        if (invalid) {
          canvas.remove(rect);
        } else {
          syncCanvasToState();
          setDrawType();
          selectCanvasObject(rect as LabeledObject);
        }

        isDrawing.current = false;
      }
    },

    'mouse:move': (e: fabric.IEvent<Event>) => {
      if (!isDrawing.current) return;

      const { evt } = parseEvent(e as fabric.IEvent<MouseEvent>);
      const { x, y } = canvas.getPointer(evt);
      const { x: origX, y: origY } = origPosition.current;
      const { w: canvasW, h: canvasH } = canvasInitSize!;

      const x_ = Math.max(offset.x, x < origX ? x : origX);
      const x2_ = Math.min(canvasW - offset.x, x > origX ? x : origX);
      const y_ = Math.max(offset.y, y < origY ? y : origY);
      const y2_ = Math.min(canvasH - offset.y, y > origY ? y : origY);

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
    'mouse:down': (e: fabric.IEvent<Event>) => {
      isEditing.current = true;
    },

    'mouse:up': (e: fabric.IEvent<Event>) => {
      isEditing.current = false;
      isObjectMoving.current = false;
    },

    'mouse:move': (e: fabric.IEvent<Event>) => {
      const { switched } = trySwitchGroup(e, 'box:edit');
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
        const x_ = Math.min(Math.max(offset.x, x), canvasW - offset.x - w!);
        const y_ = Math.min(Math.max(offset.y, y), canvasH - offset.y - h!);
        if (x === x_ && y === y_) return;

        rect.set({
          left: x_ - STROKE_WIDTH / 2,
          top: y_ - STROKE_WIDTH / 2,
        });
      } else {
        const minGap = 2 * STROKE_WIDTH;
        const x_ = Math.min(Math.max(offset.x, x), canvasW - offset.x - minGap);
        const y_ = Math.min(Math.max(offset.y, y), canvasH - offset.y - minGap);
        const x2_ = Math.min(
          Math.max(offset.x + minGap, x2),
          canvasW - offset.x
        );
        const y2_ = Math.min(
          Math.max(offset.y + minGap, y2),
          canvasH - offset.y
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

    'object:moving': (e: fabric.IEvent<Event>) => {
      isObjectMoving.current = true;
    },

    'object:modified': (e: fabric.IEvent<Event>) => {
      syncCanvasToState();
    },
  };

  const drawPointListeners = {
    'mouse:up': (e: fabric.IEvent<Event>) => {
      const { evt } = parseEvent(e as fabric.IEvent<MouseEvent>);
      const { x, y } = canvas.getPointer(evt);

      if (!inImageOI(x, y)) return;

      const category = selectedCategory || NEW_CATEGORY_NAME;
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

      syncCanvasToState();
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
      const { switched } = trySwitchGroup(e, 'point:edit');
      if (switched) return;

      const circle = canvas.getActiveObject() as fabric.Circle;
      if (!circle || !isEditing.current) return;

      const { w: canvasW, h: canvasH } = canvasInitSize!;
      const { left, top } = circle;

      circle.set({
        left: Math.min(Math.max(offset.x, left!), canvasW - offset.x),
        top: Math.min(Math.max(offset.y, top!), canvasH - offset.y),
      });

      canvas.requestRenderAll();
    },

    'object:modified': (e: fabric.IEvent<Event>) => {
      syncCanvasToState();
    },
  };

  const drawLineListeners = {
    'mouse:down': (e: fabric.IEvent<Event>) => {
      if (!isDrawing.current) {
        const { evt } = parseEvent(e as fabric.IEvent<MouseEvent>);
        const { x, y } = canvas.getPointer(evt);

        if (!inImageOI(x, y)) return;

        const category = selectedCategory || NEW_CATEGORY_NAME;
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
        }).toCanvasObjects(color, LabelRenderMode.Drawing)[0];

        canvas.add(line);
        isDrawing.current = true;
      } else {
        const line = canvas.getObjects().at(-1)! as fabric.Line;
        const invalid =
          line.width! <= STROKE_WIDTH && line.height! <= STROKE_WIDTH;

        if (invalid) {
          canvas.remove(line);
        } else {
          syncCanvasToState();
          setDrawType();
          selectCanvasObject(line as fabric.Object as LabeledObject);
        }

        isDrawing.current = false;
      }
    },

    'mouse:move': (e: fabric.IEvent<Event>) => {
      if (!isDrawing.current) return;

      const { evt } = parseEvent(e as fabric.IEvent<MouseEvent>);
      const { x, y } = canvas.getPointer(evt);
      const { w: canvasW, h: canvasH } = canvasInitSize!;

      const line = canvas.getObjects().at(-1)! as fabric.Line;

      line.set({
        x2: Math.min(Math.max(offset.x, x), canvasW - offset.x),
        y2: Math.min(Math.max(offset.y, y), canvasH - offset.y),
      });

      canvas.requestRenderAll();
    },
  };

  const editLineListeners = {
    'mouse:down': (e: fabric.IEvent<Event>) => {
      isEditing.current = true;
    },

    'mouse:up': (e: fabric.IEvent<Event>) => {
      isEditing.current = false;
    },

    'mouse:move': (e: fabric.IEvent<Event>) => {
      const { switched } = trySwitchGroup(e, 'line:edit');
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
            : r > canvasW - offset.x
            ? canvasW - offset.x - r
            : 0;

        const t = Math.min(y1_, y2_);
        const b = Math.max(y1_, y2_);
        const translateY =
          t < offset.y
            ? offset.y - t
            : b > canvasH - offset.y
            ? canvasH - offset.y - b
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

        const x_ = Math.min(Math.max(offset.x, left!), canvasW - offset.x);
        const y_ = Math.min(Math.max(offset.y, top!), canvasH - offset.y);

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

    'object:modified': (e: fabric.IEvent<Event>) => {
      syncCanvasToState();
    },
  };

  const drawMaskListeners = {
    'mouse:down': (e: fabric.IEvent<Event>) => {
      const { evt, target } = parseEvent(e as fabric.IEvent<MouseEvent>);
      const { x, y } = canvas.getPointer(evt);

      if (!inImageOI(x, y)) return;

      if (!isDrawing.current) {
        const category = selectedCategory || NEW_CATEGORY_NAME;
        const id = Math.max(-1, ...curState.map(({ id }) => id)) + 1;
        console.log(
          curState.map(({ id }) => id),
          id
        );
        const color = getColor(category);

        const objs = new MaskLabel({
          points: [{ x, y }],
          category,
          id,
          scale,
          offset,
          coordSystem: CoordSystemType.Canvas,
        }).toCanvasObjects(color, LabelRenderMode.Drawing);

        canvas.add(...objs);

        const lastCircle = objs.pop() as fabric.Circle;
        const line = new fabric.Line(
          [
            lastCircle.left!,
            lastCircle.top!,
            lastCircle.left!,
            lastCircle.top!,
          ],
          {
            ...LINE_DEFAULT_CONFIG,
            stroke: lastCircle.fill as string,
            selectable: false,
          }
        );
        line.setOptions({
          id,
          syncToLabel: false,
        });
        canvas.add(line);
        canvas.add(lastCircle);

        isDrawing.current = true;
      } else {
        if (!target) {
          const circle = canvas.getObjects().at(-1)! as fabric.Circle;
          const { id } = circle as fabric.Object as LabeledObject;
          const color = circle.fill as string;

          const polygon = canvas
            .getObjects()
            .filter(
              (obj) =>
                obj.type === 'polygon' && (obj as LabeledObject).id === id
            )[0] as fabric.Polygon;

          const points = polygon.points!;
          points.push(new fabric.Point(x, y));

          const lastCircle = new fabric.Circle({
            ...POINT_DEFAULT_CONFIG,
            left: x,
            top: y,
            fill: color,
            stroke: TRANSPARENT,
            selectable: false,
          });
          lastCircle.setOptions({
            id,
            pidOfPolygon: points.length - 1,
            syncToLabel: false,
          });

          const line = new fabric.Line([x, y, x, y], {
            ...LINE_DEFAULT_CONFIG,
            stroke: color,
            selectable: false,
          });
          line.setOptions({ id, syncToLabel: false });

          canvas.add(line);
          canvas.add(lastCircle);
        } else {
          if (target.type !== 'circle') return;

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
          const invalid = points.length < 3;
          if (invalid) {
            canvas.remove(
              ...canvas
                .getObjects()
                .filter((obj) => (obj as LabeledObject).id === id)
            );
          } else {
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

      const line = canvas.getObjects().at(-2)! as fabric.Line;

      line.set({
        x2: Math.min(Math.max(offset.x, x), canvasW - offset.x),
        y2: Math.min(Math.max(offset.y, y), canvasH - offset.y),
      });

      canvas.requestRenderAll();
    },
  };

  const editMaskListeners = {
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

      const { switched } = trySwitchGroup(e, 'mask:edit');
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

        const x_ = Math.min(Math.max(offset.x, left!), canvasW - offset.x);
        const y_ = Math.min(Math.max(offset.y, top!), canvasH - offset.y);

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

        const x_ = Math.min(Math.max(offset.x, left!), canvasW - offset.x);
        const y_ = Math.min(Math.max(offset.y, top!), canvasH - offset.y);

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
  };

  const setListeners = (group: string) => {
    isPanning.current = false;
    isDrawing.current = false;
    isEditing.current = false;
    isObjectMoving.current = false;

    let listeners: { [key: string]: (e: fabric.IEvent<Event>) => void } = {};

    if (group === 'default')
      listeners = { ...sharedListeners, ...defaultListeners };

    if (group === 'box:edit')
      listeners = { ...sharedListeners, ...editBoxListeners };

    if (group === 'box:draw')
      listeners = { ...sharedListeners, ...drawBoxListeners };

    if (group === 'point:edit')
      listeners = { ...sharedListeners, ...editPointListeners };

    if (group === 'point:draw')
      listeners = { ...sharedListeners, ...drawPointListeners };

    if (group === 'line:edit')
      listeners = { ...sharedListeners, ...editLineListeners };

    if (group === 'line:draw')
      listeners = { ...sharedListeners, ...drawLineListeners };

    if (group === 'mask:edit')
      listeners = { ...sharedListeners, ...editMaskListeners };

    if (group === 'mask:draw')
      listeners = { ...sharedListeners, ...drawMaskListeners };

    canvas.off();
    Object.entries(listeners).forEach(([event, handler]) =>
      canvas.on(event, handler)
    );

    listenerGroup.current = group;
  };

  const trySwitchGroup = (e: fabric.IEvent<Event>, currGroup: string) => {
    const { pointer, target, evt } = parseEvent(e as fabric.IEvent<MouseEvent>);
    const newGroup =
      target && target.type !== 'textbox'
        ? (target as LabeledObject).labelType + ':edit'
        : 'default';

    if (currGroup === newGroup)
      return { pointer, switched: false, target, evt };

    setListeners(newGroup);

    if (e.e.type === 'mousemove')
      canvas.fire('mouse:over', { target, pointer });

    return { pointer, switched: true, target, evt };
  };

  const refreshListeners = () => setListeners(listenerGroup.current);
  const resetListeners = () => setListeners('default');

  return resetListeners;
};
