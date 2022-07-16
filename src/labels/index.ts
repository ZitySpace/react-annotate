import { LabelType } from './BaseLabel';
import { PointLabel } from './PointLabel';
import { LineLabel } from './LineLabel';
import { BoxLabel } from './BoxLabel';

export { Label, LabelType, DefaultLabelMode } from './BaseLabel';
export { PointLabel } from './PointLabel';
export { LineLabel } from './LineLabel';
export { BoxLabel } from './BoxLabel';

export interface LabeledObject extends fabric.Object {
  labelType: LabelType;
  category: string;
  id: number;
  timestamp: string;
  hash: string;
  syncToLabel: boolean;
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
    : null;
