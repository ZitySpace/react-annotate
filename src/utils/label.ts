import { Point } from '../classes/Geometry/Point';
import { Label, LabelType } from '../classes/Label';
import { LineLabel } from '../classes/Label/LineLabel';
import { PointLabel } from '../classes/Label/PointLabel';
import { PolygonLabel } from '../classes/Label/PolygonLabel';
import { RectLabel } from '../classes/Label/RectLabel';

interface something {
  type: string;
  labelType: LabelType;
}

const _newLabel = {
  [LabelType.Point]: (args: any) => new PointLabel(args),
  [LabelType.Line]: (args: any) => new LineLabel(args),
  [LabelType.Rect]: (args: any) => new RectLabel(args),
  [LabelType.Polygon]: (args: any) => new PolygonLabel(args),
};

export function newLabel({
  labelType,
  position,
  category,
  id,
  scale,
  offset,
}: {
  labelType: LabelType;
  position: Point;
  category: string;
  id: number;
  scale: number;
  offset: Point;
}): Label;

export function newLabel({
  obj,
  scale,
  offset,
}: {
  obj: fabric.Object;
  scale: number;
  offset: Point;
}): Label;

export function newLabel({
  labelType,
  position,
  category,
  id,
  scale = 1,
  offset = new Point(),
  obj,
}: {
  labelType?: LabelType;
  category?: string;
  id?: number;
  scale?: number;
  offset?: Point;
  position?: Point;
  obj?: fabric.Object;
}): Label {
  if (position && labelType) {
    const { x, y } = position;
    return _newLabel[labelType]({ x, y, category, id, scale, offset });
  } else {
    const { labelType } = obj as any;
    return _newLabel[labelType]({ obj, scale, offset });
  }
}

const isSomething = (target: something, type: string, labelType: LabelType[]) =>
  (target?.type ? target.type === type : true) &&
  labelType.includes(target.labelType);

export const isRect = (target: any) =>
  target && isSomething(target, 'rect', [LabelType.Rect]);

export const isPoint = (target: any) =>
  target && isSomething(target, 'circle', [LabelType.Point]);

export const isLine = (target: any) =>
  target && isSomething(target, 'line', [LabelType.Line]);

export const isPolygon = (target: any) =>
  target && isSomething(target, 'polygon', [LabelType.Polygon]);

export const isMidpoint = (target: any) => target && target.type === 'midpoint';

export const isEndpoint = (target: any) =>
  target && isSomething(target, 'circle', [LabelType.Line, LabelType.Polygon]);

export const isPolygonLine = (target: any) =>
  target && isSomething(target, 'line', [LabelType.Polygon]);

export const isPolygonEndpoint = (target: any) =>
  target && isSomething(target, 'circle', [LabelType.Polygon]);

export const isLabel = (target: any) =>
  [isRect, isLine, isPoint, isPolygon].some((fn) => fn(target));

/**
 * Update associated lines' position if the endpoint is moved
 * @param event canvas' fabric object moving event
 */
export const updateEndpointAssociatedLinesPosition = (
  object: fabric.Object,
  needUpdateCoords: boolean = false
) => {
  if (object && isEndpoint(object)) {
    const { left, top, lines, _id } = object as any;
    lines.forEach((line: fabric.Line) => {
      const { endpoints, midpoint } = line as any;
      const [{ left: x1, top: y1 }] = endpoints.filter(
        (p: any) => p._id !== _id
      );
      line.set({ x1, y1, x2: left, y2: top });
      needUpdateCoords;
      if (midpoint) {
        const { x, y } = line.getCenterPoint();
        midpoint.set({ left: x, top: y });
      }
    });
  }
};

/**
 * update fabric object and its associated objects' coordinates on the operation layer
 * @param object movde/reposition fabric object
 */
export const updateCoords = (object: fabric.Object) => {
  object?.setCoords();
  const { endpoints, midpoint, line, lines } = object as any;
  midpoint?.setCoords();
  line?.setCoords();
  lines?.forEach((line: fabric.Object) => line.setCoords());
  endpoints?.forEach((endpoint: fabric.Object) => endpoint.setCoords());
};
