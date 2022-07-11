import { LabelType } from './BaseLabel';
import { PointLabel } from './PointLabel';
import { LineLabel } from './LineLabel';
import { RectLabel } from './RectLabel';

export { Label, LabelType } from './BaseLabel';
export { PointLabel } from './PointLabel';
export { LineLabel } from './LineLabel';
export { RectLabel } from './RectLabel';

export interface LabeledObject extends fabric.Object {
  labelType: LabelType;
  category: string;
  id: number;
  timestamp: string;
  hash: string;
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
    ? PointLabel.newFromCanvasObject({
        obj,
        scale,
        offset,
        timestamp,
        hash,
      })
    : obj.labelType === LabelType.Rect
    ? RectLabel.newFromCanvasObject({
        obj,
        scale,
        offset,
        timestamp,
        hash,
      })
    : null;
