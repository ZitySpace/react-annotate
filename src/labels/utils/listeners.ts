import { LabelType, LabeledObject } from '../Base';
import { PointLabel } from '../Point/label';
import { LineLabel } from '../Line/label';
import { BoxLabel } from '../Box/label';
import { MaskLabel } from '../Mask/label';

export const getBoundedValue = (value: number, min: number, max: number) => {
  return Math.min(Math.max(min, value), max);
};

export function parseEvent<T extends MouseEvent | WheelEvent>(
  e: fabric.IEvent<T>
) {
  const { button, target, pointer, e: evt } = e;
  evt.preventDefault();
  evt.stopPropagation();

  return { button, target, pointer, evt };
}

export const newLabelFromCanvasObject = ({
  obj,
  scale,
  offset,
  timestamp,
  hash,
}: {
  obj: LabeledObject;
  scale: number;
  offset: { x: number; y: number };
  timestamp?: string;
  hash?: string;
}) =>
  obj.labelType === LabelType.Point
    ? PointLabel.newFromCanvasObject({
        obj,
        scale,
        offset,
        timestamp,
        hash,
      })
    : obj.labelType === LabelType.Line
    ? LineLabel.newFromCanvasObject({
        obj,
        scale,
        offset,
        timestamp,
        hash,
      })
    : obj.labelType === LabelType.Box
    ? BoxLabel.newFromCanvasObject({
        obj,
        scale,
        offset,
        timestamp,
        hash,
      })
    : obj.labelType === LabelType.Mask
    ? MaskLabel.newFromCanvasObject({
        obj,
        scale,
        offset,
        timestamp,
        hash,
      })
    : null;
