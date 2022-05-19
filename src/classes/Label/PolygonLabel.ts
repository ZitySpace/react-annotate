import { fabric } from 'fabric';
import { Label, LabelType } from '.';
import {
  LINE_DEFAULT_CONFIG,
  POINT_DEFAULT_CONFIG,
  POLYGON_DEFAULT_CONFIG,
  RADIUS,
  STROKE_WIDTH,
  TEXTBOX_DEFAULT_CONFIG,
  TRANSPARENT,
} from '../../interfaces/config';
import { boundaryOfPolygon, deepClone } from '../../utils';
import { Point } from '../Geometry/Point';
import { Rect } from '../Geometry/Rect';
import { getFontSize } from '../../utils';

interface PolygonLabelArgs {
  category?: string;
  id?: number;
  scale?: number;
  offset?: Point;
  x?: number;
  y?: number;
  points?: number[];
  obj?: fabric.Polygon;
}

export class PolygonLabel extends Label {
  boundary: Rect;
  points: Point[];

  constructor({ obj, scale, offset }: PolygonLabelArgs); // construct from fabric object
  constructor({ x, y, category, id, scale, offset }: PolygonLabelArgs); // construct from cursor position
  constructor({ points, category, id }: PolygonLabelArgs); // construct from existing data
  constructor({
    x = 0,
    y = 0,
    category = '',
    id = 0,
    scale = 1,
    offset = new Point(),
    points,
    obj,
  }: PolygonLabelArgs) {
    const labelType = LabelType.Polygon;
    if (obj) {
      const { points, scaleX, scaleY, category, id } = obj as any;
      super({ labelType, category, id, scale, offset });
      this.points = points.map(
        ({ x, y }: Point) => new Point(x * scaleX, y * scaleY)
      );
      const { x, y, w, h } = boundaryOfPolygon(this.points);
      this.boundary = new Rect(x, y, w, h);
    } else {
      super({ labelType, category, id, scale, offset });
      const splitPoints: Point[] | undefined = points ? [] : undefined;
      while (splitPoints && points?.length) {
        const [_x, _y] = points.splice(0, 2);
        splitPoints.push(new Point(_x, _y));
      }
      this.points = splitPoints || [new Point(x, y), new Point(x, y)];
      const { x: left, y: top, w, h } = boundaryOfPolygon(this.points);
      this.boundary = new Rect(left, top, w, h);
    }
  }

  scaleTransform(scale: number, offset: Point = new Point()): this {
    if (this.scale !== 1 || this.offset.x || this.offset.y) this.origin();
    this.scale = scale;
    this.offset = offset;
    this.points.forEach((p) => p.zoom(scale).translate(offset));
    const { x: left, y: top, w, h } = boundaryOfPolygon(this.points);
    this.boundary = new Rect(left, top, w, h);
    return this;
  }

  origin(): this {
    this.points.forEach((p) =>
      p.translate(this.offset.inverse()).zoom(1 / this.scale)
    );
    this.scale = 1;
    this.offset = new Point();
    return this;
  }

  getAnnotation() {
    const points = this.points;
    return {
      ...this,
      points: points.map((p) =>
        p.translate(this.offset.inverse()).zoom(1 / this.scale)
      ),
    };
  }

  /**
   * generate fabric objects from the label
   * @param color the color of the category
   * @param needText is it need to show the text
   * @returns
   */
  getFabricObjects(color: string, needText: boolean = true) {
    const { boundary, points, id, category, labelType } = this;
    const isPolygonClosed = points.length > 2;

    // generate polygon
    const polygon = new fabric.Polygon(points, {
      ...POLYGON_DEFAULT_CONFIG,
      left: boundary.x - STROKE_WIDTH / 2,
      top: boundary.y - STROKE_WIDTH / 2,
      fill: color,
      visible: needText,
    });

    // generate endpoints, without last point if polygon is closed
    const endpoints = points.map(({ x, y }, _id) => {
      const endpoint = new fabric.Circle({
        ...POINT_DEFAULT_CONFIG,
        left: x,
        top: y,
        fill: color,
        stroke: TRANSPARENT,
        selectable: isPolygonClosed,
        visible: !needText,
      });

      endpoint.setOptions({ _id, lines: [], polygon });
      return endpoint;
    });

    // generate lines
    const lines = (isPolygonClosed ? [...points, points[0]] : points) // add origin to the end to generate close line
      .map((thePoint, idx, points) => [thePoint, points[idx + 1]]) // [[p0, p1], [p1, p2], [p2, p0], [p0, undefined]]
      .slice(0, points.length - (isPolygonClosed ? 0 : 1)) // remove last line which composed with undefined
      .map(([{ x, y }, { x: _x, y: _y }], _id) => {
        const line = new fabric.Line([x, y, _x, _y], {
          ...LINE_DEFAULT_CONFIG,
          stroke: color,
          visible: !needText,
        });

        const { x: left, y: top } = line.getCenterPoint();
        const midpoint = new fabric.Circle({
          ...POINT_DEFAULT_CONFIG,
          left,
          top,
          fill: color,
          stroke: TRANSPARENT,
          type: 'midpoint',
          hoverCursor: 'copy',
        });

        midpoint.setOptions({ _id, line, polygon });
        line.setOptions({ midpoint });
        return line;
      });

    // associate lines and endpoints
    isPolygonClosed && endpoints.push(endpoints[0]); // push the origin into the endpoints array
    lines.forEach((line, idx) => {
      const endpointsOfLine = endpoints.slice(idx, idx + 2); // get endpoints of line
      endpointsOfLine.forEach((endpoint) => (endpoint as any).lines.push(line)); // add line to endpoint
      [line, (line as any).midpoint].forEach((obj) =>
        obj.setOptions({ endpoints: endpointsOfLine, polygon })
      ); // add endpoints to line
    });
    isPolygonClosed && endpoints.pop(); // remove the last endpoint if polygon is closed

    // associate lines and endpoints to polygon
    polygon.setOptions({ endpoints, lines });

    // generate textbox
    const topPoint = deepClone(points).sort((a, b) => a.y - b.y)[0];
    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: topPoint.x,
      top: topPoint.y - RADIUS,
      originX: 'center',
      originY: 'bottom',
      backgroundColor: color,
      fontSize: getFontSize(boundary.w, boundary.h),
    });

    const products: fabric.Object[] = needText
      ? [textbox, polygon, ...lines, ...endpoints]
      : [polygon, ...lines, ...endpoints];

    products.forEach((obj) => obj.setOptions({ labelType, category, id }));
    return products;
  }
}
