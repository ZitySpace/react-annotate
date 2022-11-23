import randomColor from 'randomcolor';
import { fabric } from 'fabric';
import md5 from 'md5';
import {
  Label,
  LabelType,
  CoordSystemType,
  LabelRenderMode,
  LabeledObject,
} from '../Base';
import {
  LINE_DEFAULT_CONFIG,
  POINT_DEFAULT_CONFIG,
  TEXTBOX_DEFAULT_CONFIG,
  TRANSPARENT,
  RADIUS,
} from '../config';
import { getLocalTimeISOString } from '../utils/label';

type Keypoints = {
  x: number;
  y: number;
  vis: boolean;
  sid: number;
  pid?: number;
}[];

export interface KeypointsLabelConfig {
  structure: [number, number][];
}

export let keypointsLabelConfig: KeypointsLabelConfig = {
  structure: [],
};

export const setKeypointsLabelConfig = (cfg: KeypointsLabelConfig) => {
  keypointsLabelConfig = cfg;
};

export const nColor = 20;
export const colorMap = randomColor({
  seed: 19,
  format: 'rgba',
  alpha: 1,
  count: nColor,
});

export class KeypointsLabel extends Label {
  keypoints: Keypoints;

  constructor({
    keypoints,
    category = '',
    id = 0,
    scale = 1,
    offset = { x: 0, y: 0 },
    coordSystem = CoordSystemType.Image,
    timestamp,
    hash,
  }: {
    keypoints: Keypoints;
    category: string;
    id: number;
    scale?: number;
    offset?: { x: number; y: number };
    coordSystem?: CoordSystemType;
    timestamp?: string;
    hash?: string;
  }) {
    const labelType = LabelType.Keypoints;
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

    let pidNxt: number = Math.max(...keypoints.map((pt) => pt.pid ?? 0)) + 1;
    keypoints.forEach((pt) => {
      if (pt.pid === undefined) pt.pid = pidNxt++;
    });

    this.keypoints = keypoints;
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
    const {
      category,
      id,
      timestamp: timestamp_,
      hash: hash_,
    } = grp[0] as LabeledObject;

    const keypoints = grp.map((circle) => {
      const { vis, sid, pid } = circle as any as {
        vis: boolean;
        sid: number;
        pid: number;
      };
      const { left, top } = circle as fabric.Circle;

      return { x: left!, y: top!, vis, sid, pid };
    });

    return new KeypointsLabel({
      keypoints,
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
    new KeypointsLabel({
      keypoints: this.keypoints.map((pt) => ({ ...pt })),
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
    const keypoints = this.keypoints.map((pt) => ({
      ...super._toCanvasCoordSystem(scale, offset, { x: pt.x, y: pt.y }),
      vis: pt.vis,
      sid: pt.sid,
      pid: pt.pid,
    }));

    const t = inplace ? this : this.clone();

    t.keypoints = keypoints;
    t.scale = scale;
    t.offset = offset;
    t.coordSystem = CoordSystemType.Canvas;
    return t;
  };

  toImageCoordSystem = (inplace = true) => {
    const keypoints = this.keypoints.map((pt) => ({
      ...super._toImageCoordSystem({ x: pt.x, y: pt.y }),
      vis: pt.vis,
      sid: pt.sid,
      pid: pt.pid,
    }));

    const t = inplace ? this : this.clone();

    t.keypoints = keypoints;
    t.scale = 1;
    t.offset = { x: 0, y: 0 };
    t.coordSystem = CoordSystemType.Image;
    return t;
  };

  toCanvasObjects = (
    color: string,
    mode: string,
    pidsSelected: number[] = []
  ) => {
    const { keypoints, labelType, category, id, timestamp, hash } = this;
    const selected = mode === LabelRenderMode.Selected;

    const { structure } = keypointsLabelConfig;
    let pidNxt: number = Math.max(...keypoints.map((k) => k.pid!)) + 1;

    const circles = keypoints.map((pt) => {
      const circle = new fabric.Circle({
        ...POINT_DEFAULT_CONFIG,
        left: pt.x,
        top: pt.y,
        fill: colorMap[(pt.sid === -1 ? id : pt.sid) % nColor],
        stroke: pt.vis ? TRANSPARENT : 'rgba(0, 0, 0, 0.75)',
        radius:
          selected && pidsSelected.includes(pt.pid!) ? 1.5 * RADIUS : RADIUS,
      });

      circle.setOptions({
        labelType,
        category,
        id,
        timestamp,
        hash,
        syncToLabel: true,
        vis: pt.vis,
        sid: pt.sid,
        pid: pt.pid ?? pidNxt++,
      });

      return circle;
    });

    if (mode === LabelRenderMode.Hidden) {
      circles.forEach((c) => {
        c.visible = false;
        c.hasControls = false;
      });
      return circles;
    }

    const keypoints_ = keypoints.filter((pt) => pt.sid !== -1);
    const keypointsMap = keypoints_.reduce(
      (map, pt) => ({ ...map, [pt.sid]: pt }),
      {}
    ) as {
      [key: number]: { x: number; y: number; vis: boolean; sid: number };
    };

    const circlesMap = circles.reduce((map, c) => {
      const { sid } = c as any as { sid: number };
      if (sid === -1) return map;
      return { ...map, [sid]: c };
    }, {}) as {
      [key: number]: fabric.Circle;
    };

    const lines = structure.reduce((acc: fabric.Line[], lk) => {
      const p0 = keypointsMap[lk[0]];
      const p1 = keypointsMap[lk[1]];
      if (!p0 || !p1) return acc;

      const line = new fabric.Line([p0.x, p0.y, p1.x, p1.y], {
        ...LINE_DEFAULT_CONFIG,
        stroke: colorMap[id % nColor],
        selectable: false,
        hoverCursor: 'default',
        strokeDashArray: p0.vis && p1.vis ? undefined : [5],
      });

      line.setOptions({
        labelType,
        category,
        id,
        timestamp,
        hash,
        syncToLabel: false,
      });

      // build connections between related circles and lines
      const c0 = circlesMap[lk[0]];
      const c1 = circlesMap[lk[1]];
      c0.setOptions({
        linesStarting: [...((c0 as any).linesStarting || []), line],
      });
      c1.setOptions({
        linesEnding: [...((c1 as any).linesEnding || []), line],
      });

      return [...acc, line];
    }, []);

    if (mode === LabelRenderMode.Drawing || mode === LabelRenderMode.Selected)
      return [lines, circles];

    const xs = (keypoints_.length ? keypoints_ : keypoints).map((pt) => pt.x);
    const ys = (keypoints_.length ? keypoints_ : keypoints).map((pt) => pt.y);
    const idxOfTopPoint = ys.indexOf(Math.min(...ys));

    const textbox = new fabric.Textbox(this.id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: xs[idxOfTopPoint],
      top: ys[idxOfTopPoint] - 20,
      originX: 'center',
      originY: 'bottom',
      backgroundColor: color,
      fontSize: 20,
    });

    textbox.setOptions({
      labelType,
      category,
      id,
      timestamp,
      hash,
      syncToLabel: false,
    });

    if (mode === LabelRenderMode.Preview) return [lines, circles, textbox];

    return [];
  };
}
