import { fabric } from 'fabric';
import md5 from 'md5';
import { Label, LabelType, CoordSystemType, LabelRenderMode } from '../Base';
import {
  LINE_DEFAULT_CONFIG,
  POINT_DEFAULT_CONFIG,
  POLYGON_DEFAULT_CONFIG,
  POLYLINE_DEFAULT_CONFIG,
  RADIUS,
  STROKE_WIDTH,
  TEXTBOX_DEFAULT_CONFIG,
  TRANSPARENT,
} from '../config';
import {
  getLocalTimeISOString,
  getArea,
  calcIntersection,
  analyzeHoles,
} from '../utils/label';

export class MaskLabel extends Label {
  paths: {
    points: { x: number; y: number }[];
    closed?: boolean;
    hole?: boolean;
  }[];

  constructor({
    paths,
    category = '',
    id = 0,
    scale = 1,
    offset = { x: 0, y: 0 },
    coordSystem = CoordSystemType.Image,
    timestamp,
    hash,
  }: {
    paths: {
      points: { x: number; y: number }[];
      closed?: boolean;
      hole?: boolean;
    }[];
    category: string;
    id: number;
    scale?: number;
    offset?: { x: number; y: number };
    coordSystem?: CoordSystemType;
    timestamp?: string;
    hash?: string;
  }) {
    const labelType = LabelType.Mask;
    const now = getLocalTimeISOString();
    super({
      labelType,
      category,
      id,
      scale,
      offset,
      coordSystem,
      timestamp: timestamp || now,
      hash: hash || md5(now),
    });
    paths.forEach((p) => {
      p.closed = p.closed ?? true;
      p.hole = p.hole ?? false;
    });
    this.paths = paths;
  }

  public static newFromCanvasObject = ({
    grp,
    scale,
    offset,
    timestamp,
    hash,
  }: {
    grp: fabric.Object[];
    scale: number;
    offset: { x: number; y: number };
    timestamp?: string;
    hash?: string;
  }) => {
    const { category, id, timestamp: timestamp_, hash: hash_ } = grp[0] as any;
    const paths = grp.map((pl) => {
      const { closed, hole } = pl as any as { closed: boolean; hole: boolean };
      return {
        points: (pl as fabric.Polyline).points!.map((pt) => ({
          x: pt.x,
          y: pt.y,
        })),
        closed,
        hole,
      };
    });

    return new MaskLabel({
      paths,
      category,
      id,
      scale,
      offset,
      coordSystem: CoordSystemType.Canvas,
      timestamp: timestamp || timestamp_,
      hash: hash || hash_,
    });
  };

  clone = () =>
    new MaskLabel({
      paths: this.paths.map((path) => ({
        points: path.points.map((pt) => ({ ...pt })),
        closed: path.closed,
        hole: path.hole,
      })),
      category: this.category,
      id: this.id,
      scale: this.scale,
      offset: { x: this.offset.x, y: this.offset.y },
      coordSystem: this.coordSystem,
      timestamp: this.timestamp,
      hash: this.hash,
    });

  toCanvasCoordSystem = (
    {
      scale,
      offset,
    }: {
      scale: number;
      offset: { x: number; y: number };
    },
    inplace = true
  ) => {
    const paths = this.paths.map((path) => ({
      points: path.points.map((pt) =>
        super._toCanvasCoordSystem(scale, offset, pt)
      ),
      closed: path.closed,
      hole: path.hole,
    }));

    const t = inplace ? this : this.clone();

    t.paths = paths;
    t.scale = scale;
    t.offset = offset;
    t.coordSystem = CoordSystemType.Canvas;
    return t;
  };

  toImageCoordSystem = (inplace = true) => {
    const paths = this.paths.map((path) => ({
      points: path.points.map((pt) => super._toImageCoordSystem(pt)),
      closed: path.closed,
      hole: path.hole,
    }));

    const t = inplace ? this : this.clone();

    t.paths = paths;
    t.scale = 1;
    t.offset = { x: 0, y: 0 };
    t.coordSystem = CoordSystemType.Image;
    return t;
  };

  toCanvasObjects = (color: string, mode: string) => {
    const { paths, labelType, category, id, timestamp, hash } = this;

    const polylines = paths
      .filter((path) => !path.closed)
      .map(
        (path) =>
          new fabric.Polyline(
            path.points.map((pt) => ({ ...pt })),
            {
              ...POLYLINE_DEFAULT_CONFIG,
              stroke: color,
            }
          )
      );

    const posPaths = paths.filter((path) => path.closed && !path.hole);
    // sort by area
    posPaths.sort((p1, p2) => getArea(p2.points) - getArea(p1.points));

    const negPaths = paths.filter((path) => path.closed && path.hole);

    // for each hole/negPath, find the posPath that encicle it fully and merge
    // them, otherwise render it as polyline instead of polygon as a reminder
    // of not perfect hole annotation

    // console.log(
    //   calcIntersection(
    //     { x: 100, y: 0 },
    //     { x: 100, y: 100 },
    //     { x: 99.99, y: 30 },
    //     { x: 120, y: 30 },
    //     0.010001
    //   )
    // );

    console.log(
      analyzeHoles(
        [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
        [
          [
            { x: -0.01, y: -0.01 },
            { x: 30, y: -0.01 },
            // { x: 0, y: 0 },
            // { x: 30, y: 0 },
            { x: 30, y: 30 },
            { x: 0, y: 30 },
          ],
          [
            { x: 60, y: 0 },
            { x: 90, y: 0 },
            { x: 90, y: 30 },
            { x: 60, y: 30 },
          ],
          [
            { x: 99.99, y: 30 },
            { x: 120, y: 30 },
            { x: 120, y: 50 },
            { x: 99.99, y: 50 },
          ],
          [
            { x: 0, y: 60 },
            { x: 110, y: 60 },
            { x: 110, y: 70 },
            { x: 0, y: 70 },
          ],
          [
            { x: -10, y: 100 },
            { x: 0, y: 100 },
            { x: 0, y: 110 },
            { x: -10, y: 110 },
          ],
        ],
        0.010001
      )
    );

    const standalone = { pos: [], neg: [] };
    const enciclegrp = [];

    return [];

    /*
    const polygon = new fabric.Polygon(
      points.map((pt) => ({ ...pt })),
      {
        ...POLYGON_DEFAULT_CONFIG,
        fill: color,
      }
    );

    polygon.setOptions({
      labelType,
      category,
      id,
      timestamp,
      hash,
      syncToLabel: true,
    });

    if (mode === LabelRenderMode.Hidden) {
      polygon.visible = false;
      polygon.hasControls = false;
      return [polygon];
    }

    const ys = points.map((p) => p.y);
    const idxOfTopPoint = ys.indexOf(Math.min(...ys));

    const textbox = new fabric.Textbox(this.id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: points[idxOfTopPoint].x,
      top: points[idxOfTopPoint].y - RADIUS - STROKE_WIDTH / 2,
      originX: 'center',
      originY: 'bottom',
      backgroundColor: color,
    });

    textbox.setOptions({
      labelType,
      category,
      id,
      timestamp,
      hash,
      syncToLabel: false,
    });

    if (mode === LabelRenderMode.Preview) return [polygon, textbox];

    const circles = points.map(
      (pt) =>
        new fabric.Circle({
          ...POINT_DEFAULT_CONFIG,
          left: pt.x,
          top: pt.y,
          fill: color,
          stroke: TRANSPARENT,
        })
    );

    circles.forEach((c, i) =>
      c.setOptions({
        labelType,
        category,
        id,
        timestamp,
        hash,
        syncToLabel: false,
        lineStarting: null,
        lineEnding: null,
        pointOfPolygon: polygon.points![i],
        pidOfPolygon: i,
      })
    );

    const l = points.length;
    const lines =
      l > 1
        ? Array.from(
            { length: l },
            (_, i) =>
              new fabric.Line(
                [
                  points[i % l].x,
                  points[i % l].y,
                  points[(i + 1) % l].x,
                  points[(i + 1) % l].y,
                ],
                {
                  ...LINE_DEFAULT_CONFIG,
                  stroke: color,
                  selectable: false,
                  hoverCursor: 'default',
                }
              )
          )
        : [];

    lines.forEach((line, i) =>
      line.setOptions({
        labelType,
        category,
        id,
        timestamp,
        hash,
        syncToLabel: false,
        midpoint: null,
        pidsOfPolygon: [i % l, (i + 1) % l],
      })
    );

    l > 1 &&
      circles.forEach((circle, i) => {
        circle.setOptions({
          lineStarting: lines[i],
          lineEnding: lines[(i + l - 1) % l],
        });
      });

    const [r, g, b, a] = color.replace(/[^\d, .]/g, '').split(',');
    polygon.fill = `rgba(${r}, ${g}, ${b}, 0.01)`;
    polygon.selectable = false;

    if (mode === LabelRenderMode.Drawing) {
      circles.forEach((c) => (c.selectable = false));
      return [polygon, ...lines.slice(0, -1), ...circles];
    }

    if (mode === LabelRenderMode.Selected)
      return [polygon, ...lines, ...circles];

    return [];

    */
  };
}
