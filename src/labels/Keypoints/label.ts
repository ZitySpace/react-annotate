import randomColor from 'randomcolor';
import { fabric } from 'fabric';
import md5 from 'md5';
import {
  Label,
  LabelType,
  CoordSystemType,
  LabelRenderMode,
  LabeledObject,
  LabelConfig,
} from '../Base';
import {
  LINE_DEFAULT_CONFIG,
  POINT_DEFAULT_CONFIG,
  TEXTBOX_DEFAULT_CONFIG,
  TRANSPARENT,
} from '../config';
import { getLocalTimeISOString } from '../utils/label';

type Keypoints = { x: number; y: number; vis: boolean; sid: number }[];
interface KeypointsLabelConfig {
  structure: [number, number][];
}

const nColor = 20;
const colorMap = randomColor({
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
    config,
  }: {
    keypoints: Keypoints;
    category: string;
    id: number;
    scale?: number;
    offset?: { x: number; y: number };
    coordSystem?: CoordSystemType;
    timestamp?: string;
    hash?: string;
    config: LabelConfig | KeypointsLabelConfig;
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
      config: config || [],
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

    const { labelConfig } = grp[0] as any as { labelConfig: LabelConfig };

    const keypoints = grp.map((circle) => {
      const { vis, sid } = circle as any as { vis: boolean; sid: number };
      const { left, top } = circle as fabric.Circle;

      return { x: left!, y: top!, vis, sid };
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
      config: labelConfig,
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
      config: this.config,
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
    }));

    const t = inplace ? this : this.clone();

    t.keypoints = keypoints;
    t.scale = 1;
    t.offset = { x: 0, y: 0 };
    t.coordSystem = CoordSystemType.Image;
    return t;
  };

  toCanvasObjects = (color: string, mode: string) => {
    const { keypoints, labelType, category, id, timestamp, hash, config } =
      this;

    const structure = (config.values as KeypointsLabelConfig).structure;

    const circles = keypoints.map((pt) => {
      const circle = new fabric.Circle({
        ...POINT_DEFAULT_CONFIG,
        left: pt.x,
        top: pt.y,
        fill: colorMap[pt.sid % nColor],
        stroke: pt.vis ? TRANSPARENT : 'rgba(0, 0, 0, 0.75)',
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
        labelConfig: config,
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

    const keypoints_ = keypoints
      .filter((pt) => pt.sid !== -1)
      .reduce((acc, pt) => ({ ...acc, [pt.sid]: pt }), {}) as {
      [key: number]: { x: number; y: number; vis: boolean; sid: number };
    };

    const lines = structure.reduce((acc: fabric.Line[], lk) => {
      const p0 = keypoints_[lk[0]];
      const p1 = keypoints_[lk[1]];
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

      return [...acc, line];
    }, []);

    if (mode === LabelRenderMode.Drawing || mode === LabelRenderMode.Selected)
      return [lines, circles];

    const xs = keypoints.filter((pt) => pt.sid !== -1).map((pt) => pt.x);
    const ys = keypoints.filter((pt) => pt.sid !== -1).map((pt) => pt.y);
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
