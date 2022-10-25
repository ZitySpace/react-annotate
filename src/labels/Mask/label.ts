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

interface Path {
  points: { x: number; y: number }[];
  closed?: boolean;
  hole?: boolean;
}

export class MaskLabel extends Label {
  paths: Path[];

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
    paths: Path[];
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
    const paths = this.paths.map(
      (path) =>
        ({
          points: path.points.map((pt) =>
            super._toCanvasCoordSystem(scale, offset, pt)
          ),
          closed: path.closed,
          hole: path.hole,
        } as Path)
    );

    const t = inplace ? this : this.clone();

    t.paths = paths;
    t.scale = scale;
    t.offset = offset;
    t.coordSystem = CoordSystemType.Canvas;
    return t;
  };

  toImageCoordSystem = (inplace = true) => {
    const paths = this.paths.map(
      (path) =>
        ({
          points: path.points.map((pt) => super._toImageCoordSystem(pt)),
          closed: path.closed,
          hole: path.hole,
        } as Path)
    );

    const t = inplace ? this : this.clone();

    t.paths = paths;
    t.scale = 1;
    t.offset = { x: 0, y: 0 };
    t.coordSystem = CoordSystemType.Image;
    return t;
  };

  toCanvasObjects = (color: string, mode: string) => {
    const { paths, labelType, category, id, timestamp, hash } = this;

    if (mode === LabelRenderMode.Hidden) return [];

    const xs = paths.map((path) => path.points.map((pt) => pt.x)).flat();
    const ys = paths.map((path) => path.points.map((pt) => pt.y)).flat();
    const idxOfTopPoint = ys.indexOf(Math.min(...ys));

    const textbox = new fabric.Textbox(this.id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: xs[idxOfTopPoint],
      top: ys[idxOfTopPoint] - RADIUS - STROKE_WIDTH / 2,
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

    if (mode === LabelRenderMode.Preview) {
      const posPaths = paths.filter((path) => path.closed && !path.hole);
      // sort by area
      posPaths.sort((p1, p2) => getArea(p2.points) - getArea(p1.points));
      const negPaths = paths.filter((path) => path.closed && path.hole);

      // for each hole/negPath, find the posPath that encicle it fully and merge
      // them, otherwise render it as polyline instead of polygon as a reminder
      // of not perfect hole annotation
      const posGrps: Path[][] = [];
      const orphanPosPaths: Path[] = [];
      let orphanNegPaths = negPaths;

      posPaths.forEach((pos) => {
        const { rel } = analyzeHoles(
          pos.points,
          orphanNegPaths.map((p) => p.points)
        );
        const inner = orphanNegPaths.filter((_, i) => rel[i] === 'inner');

        if (inner.length) posGrps.push([pos, ...inner]);
        else orphanPosPaths.push(pos);

        orphanNegPaths = orphanNegPaths.filter((_, i) => rel[i] !== 'inner');
      });

      // merge holes: connect top endpoints between mask and each hole
      const groupedPosPaths = posGrps.map(
        (grp) =>
          ({
            points: grp
              .map((path, i) => {
                // find index of top endpoint
                const pts = path.points;
                const ys = pts.map((p) => p.y);
                const idxOfTopPoint = ys.indexOf(Math.min(...ys));
                const topPt = pts[idxOfTopPoint];

                const pts_ = [
                  ...pts.slice(idxOfTopPoint),
                  ...pts.slice(0, idxOfTopPoint),
                  topPt,
                ];

                const l = {
                  x: topPt.x - pts_.at(-2)!.x,
                  y: topPt.y - pts_.at(-2)!.y,
                };

                let j = 1;
                while (j < pts.length) {
                  j++;
                  const l_ = {
                    x: topPt.x - pts_.at(j)!.x,
                    y: topPt.y - pts_.at(j)!.y,
                  };
                  const d = l.x * l_.y - l_.x * l.y;

                  if ((i == 0 && d < 0) || (i > 0 && d > 0)) {
                    pts_.reverse();
                    break;
                  }
                }

                return pts_;
              })
              .flat(),
          } as Path)
      );

      // render orphan/grouped pos paths as polygons
      const polygons = [...groupedPosPaths, ...orphanPosPaths].map(
        (path) =>
          new fabric.Polygon(
            path.points.map((pt) => ({ ...pt })),
            {
              ...POLYGON_DEFAULT_CONFIG,
              fill: color,
            }
          )
      );

      polygons.forEach((pg) =>
        pg.setOptions({
          labelType,
          category,
          id,
          timestamp,
          hash,
          syncToLabel: true,
        })
      );

      // render orphan neg paths as polylines
      const polylines = [
        ...orphanNegPaths,
        ...paths.filter((path) => !path.closed),
      ].map(
        (path) =>
          new fabric.Polyline(
            path.points.map((pt) => ({ ...pt })),
            {
              ...POLYLINE_DEFAULT_CONFIG,
              stroke: color,
            }
          )
      );

      polylines.forEach((pl) =>
        pl.setOptions({
          labelType,
          category,
          id,
          timestamp,
          hash,
          syncToLabel: true,
        })
      );

      polylines.forEach((pl) => (pl.hoverCursor = undefined));
      return [polygons, polylines, textbox];
    }

    return [];
  };
}
