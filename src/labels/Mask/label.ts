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
import { getLocalTimeISOString, getArea, analyzeHoles } from '../utils/label';

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
    else if (mode === LabelRenderMode.Preview) {
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
                  x: pts_.at(-2)!.x - topPt.x,
                  y: pts_.at(-2)!.y - topPt.y,
                };

                let j = 1;
                while (j < pts.length) {
                  const l_ = {
                    x: pts_.at(j)!.x - topPt.x,
                    y: pts_.at(j)!.y - topPt.y,
                  };
                  const d = l.x * l_.y - l_.x * l.y;

                  if ((i == 0 && d < 0) || (i > 0 && d > 0)) pts_.reverse();
                  if (d !== 0) break;

                  j++;
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
      ].map((path) => {
        const pts = path.points.map((pt) => ({ ...pt }));

        if (path.closed) {
          const head = pts.at(0)!;
          const tail = pts.at(-1)!;
          if (!(head.x === tail.x && head.y === tail.y)) pts.push(head);
        }

        return new fabric.Polyline(pts, {
          ...POLYLINE_DEFAULT_CONFIG,
          stroke: color,
          strokeDashArray: path.hole ? [5] : undefined,
        });
      });

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
    } else {
      const polylines = paths.map(
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

      const circles = paths.map((path) =>
        path.points.map(
          (pt) =>
            new fabric.Circle({
              ...POINT_DEFAULT_CONFIG,
              left: pt.x,
              top: pt.y,
              fill: color,
              stroke: TRANSPARENT,
            })
        )
      );

      circles.forEach((cs, i) =>
        cs.forEach((c, j) =>
          c.setOptions({
            labelType,
            category,
            id,
            timestamp,
            hash,
            syncToLabel: false,
            lineStarting: null,
            lineEnding: null,
            polyline: polylines[i],
            point: polylines[i].points![j],
          })
        )
      );

      const lines = paths.map((path) => {
        const { points, closed, hole } = path;

        const l = points.length;

        return (closed ? points : points.slice(0, -1)).map(
          (_, i) =>
            new fabric.Line(
              [
                points[i].x,
                points[i].y,
                points[(i + 1) % l].x,
                points[(i + 1) % l].y,
              ],
              {
                ...LINE_DEFAULT_CONFIG,
                stroke: color,
                selectable: false,
                hoverCursor: 'default',
                strokeDashArray: hole ? [5] : undefined,
              }
            )
        );
      });

      lines.forEach((ls, i) =>
        ls.forEach((l, j) =>
          l.setOptions({
            labelType,
            category,
            id,
            timestamp,
            hash,
            syncToLabel: false,
            polyline: polylines[i],
            bgnpoint: polylines[i].points![j],
            endpoint:
              polylines[i].points![(j + 1) % polylines[i].points!.length],
          })
        )
      );

      circles.forEach(
        (cs, i) =>
          cs.length > 1 &&
          cs.forEach((c, j) => {
            const l = cs.length;
            const { closed } = paths[i];
            c.setOptions({
              lineStarting: j < l - 1 || closed ? lines[i][j] : null,
              lineEnding: j > 0 || closed ? lines[i][(j - 1) % l] : null,
            });
          })
      );

      const [r, g, b, a] = color.replace(/[^\d, .]/g, '').split(',');
      polylines.forEach((pl) => {
        pl.stroke = `rgba(${r}, ${g}, ${b}, 0)`;
        pl.selectable = false;
      });

      if (mode === LabelRenderMode.Drawing) {
        circles.forEach((cs) => cs.forEach((c) => (c.selectable = false)));
        return [polylines, lines, circles];
      }

      if (mode === LabelRenderMode.Selected) return [polylines, lines, circles];

      return [];
    }
  };
}
