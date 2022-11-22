import { useRef } from 'react';
import { fabric } from 'fabric';

import { setup } from '../listeners/setup';
import { parseEvent, getBoundedValue } from '../utils';
import {
  UNKNOWN_CATEGORY_NAME,
  POINT_DEFAULT_CONFIG,
  TRANSPARENT,
  RADIUS,
} from '../config';
import { CoordSystemType, LabelRenderMode, LabeledObject } from '../Base';
import {
  nColor,
  colorMap,
  KeypointsLabel,
  keypointsLabelConfig as cfg,
} from './label';

export const useKeypointsListeners = (
  syncCanvasToState: (id?: number) => void
) => {
  const {
    canvas,
    canvasInitSize,
    curState,
    scale,
    offset,
    setDrawType,
    selectedCategory,
    selectedLabels,
    getColor,
    isDrawing,
    trySwitchGroupRef,
    inImageOI,
    selectCanvasObject,
  } = setup();

  const isDragging = useRef<boolean>(false);
  const isDeleting = useRef<boolean>(false);

  if (!canvas) return {};

  const drawKeypointsListeners = {
    'mouse:down': (e: fabric.IEvent<Event>) => {
      const { evt, target, button } = parseEvent(
        e as fabric.IEvent<MouseEvent>
      );

      const { x, y } = canvas.getPointer(evt);

      if (button !== 1 || !inImageOI(x, y)) return;

      const lastCircle = canvas
        .getObjects()
        .filter((obj) => obj.type === 'circle' && (obj as any).last)[0];

      if (target && target === lastCircle) return;

      if (!isDrawing.current) {
        const category = selectedCategory || UNKNOWN_CATEGORY_NAME;
        const id = Math.max(-1, ...curState.map(({ id }) => id)) + 1;
        const color = colorMap[id % nColor];

        const [_, circles] = new KeypointsLabel({
          keypoints: [{ x, y, vis: true, sid: -1, pid: 1 }],
          category,
          id,
          scale,
          offset,
          coordSystem: CoordSystemType.Canvas,
        }).toCanvasObjects(color, LabelRenderMode.Drawing) as [
          fabric.Line[],
          fabric.Circle[]
        ];

        const circle = circles[0];
        circle.set({
          selectable: false,
          hoverCursor: 'default',
        });
        circle.setOptions({
          last: true,
        });

        canvas.add(circle);
        isDrawing.current = true;
      } else {
        const { labelType, category, id } = lastCircle as LabeledObject;

        const circles = canvas
          ?.getObjects()
          .filter(
            (obj) => (obj as LabeledObject).id === id && obj.type === 'circle'
          ) as fabric.Circle[];

        const pidNxt: number =
          Math.max(...circles.map((c) => (c as any).pid!)) + 1;

        const color = colorMap[id % nColor];

        lastCircle.setOptions({
          last: false,
        });

        const circle = new fabric.Circle({
          ...POINT_DEFAULT_CONFIG,
          left: x,
          top: y,
          fill: color,
          stroke: TRANSPARENT,
          radius: 1.5 * RADIUS,
        });

        circle.setOptions({
          labelType,
          category,
          id,
          syncToLabel: true,
          vis: true,
          sid: -1,
          pid: pidNxt,
          last: true,
          selectable: false,
          hoverCursor: 'default',
        });

        canvas.add(circle);
      }
    },

    'mouse:dblclick': (e: fabric.IEvent<Event>) => {
      const lastCircle = canvas
        .getObjects()
        .filter((obj) => obj.type === 'circle' && (obj as any).last)[0];

      const { id } = lastCircle as LabeledObject;

      syncCanvasToState(id);
      setDrawType();
      selectCanvasObject(lastCircle as LabeledObject);
    },
  };

  const editKeypointsListeners = {
    'mouse:down': (e: fabric.IEvent<Event>) => {
      const { target, button } = parseEvent(e as fabric.IEvent<MouseEvent>);
      if (!target || target.type !== 'circle') return;

      const { id } = target as LabeledObject;
      if (button === 1) {
        isDragging.current = true;
      }

      if (button === 3) {
        // prevent deleting before selected
        isDeleting.current =
          selectedLabels.length === 1 && selectedLabels[0].id === id;
      }
    },

    'mouse:up': (e: fabric.IEvent<Event>) => {
      const { target, button } = parseEvent(e as fabric.IEvent<MouseEvent>);

      if (!target || target.type !== 'circle') return;

      const { id } = target as LabeledObject;

      if (button === 3 && isDeleting.current) {
        canvas.remove(target);
        syncCanvasToState(id);
      }

      isDragging.current = false;
      isDeleting.current = false;
    },

    'mouse:move': (e: fabric.IEvent<Event>) => {
      if (!(isDragging.current || isDeleting.current)) {
        const { switched } = trySwitchGroupRef.current(e, 'mask:edit');
        if (switched) return;
      }

      const obj = canvas.getActiveObject();
      if (!obj || obj.type !== 'circle' || !isDragging.current) return;

      const { w: canvasW, h: canvasH } = canvasInitSize!;

      const circle = obj as fabric.Circle;

      const { left, top } = circle;

      const x_ = getBoundedValue(left!, offset.x, canvasW - offset.x - 1);
      const y_ = getBoundedValue(top!, offset.y, canvasH - offset.y - 1);

      circle.set({
        left: x_,
        top: y_,
      });

      const { linesStarting, linesEnding } = circle as any as {
        linesStarting?: fabric.Line[];
        linesEnding?: fabric.Line[];
      };

      linesStarting &&
        linesStarting.forEach((line) => line.set({ x1: x_, y1: y_ }));
      linesEnding &&
        linesEnding.forEach((line) => line.set({ x2: x_, y2: y_ }));
    },

    'object:modified': (e: fabric.IEvent<Event>) => {
      const { id } = e.target as LabeledObject;
      syncCanvasToState(id);
    },
  };

  return {
    drawKeypointsListeners,
    editKeypointsListeners,
  };
};
