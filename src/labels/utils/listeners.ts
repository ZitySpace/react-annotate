import { LabelType, LabeledObject } from '../Base';
import { PointLabel } from '../Point/label';
import { LineLabel } from '../Line/label';
import { BoxLabel } from '../Box/label';
import { MaskLabel } from '../Mask/label';
import { PolylineLabel } from '../Polyline/label';

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
  grp,
  scale,
  offset,
  timestamp,
  hash,
}: {
  obj?: LabeledObject;
  grp?: LabeledObject[];
  scale: number;
  offset: { x: number; y: number };
  timestamp?: string;
  hash?: string;
}) => {
  const { labelType } = obj || grp![0];

  return labelType === LabelType.Point
    ? PointLabel.newFromCanvasObject({
        obj: obj!,
        scale,
        offset,
        timestamp,
        hash,
      })
    : labelType === LabelType.Line
    ? LineLabel.newFromCanvasObject({
        obj: obj!,
        scale,
        offset,
        timestamp,
        hash,
      })
    : labelType === LabelType.Box
    ? BoxLabel.newFromCanvasObject({
        obj: obj!,
        scale,
        offset,
        timestamp,
        hash,
      })
    : labelType === LabelType.Mask
    ? MaskLabel.newFromCanvasObject({
        obj: obj!,
        scale,
        offset,
        timestamp,
        hash,
      })
    : labelType === LabelType.Polyline
    ? PolylineLabel.newFromCanvasObject({
        grp: grp!,
        scale,
        offset,
        timestamp,
        hash,
      })
    : null;
};
