import { fabric } from 'fabric';
import md5 from 'md5';
import { Label, LabelType, CoordSystemType } from './BaseLabel';
import {
  LINE_DEFAULT_CONFIG,
  POINT_DEFAULT_CONFIG,
  RADIUS,
  TEXTBOX_DEFAULT_CONFIG,
  TRANSPARENT,
} from '../interfaces/config';
import { getLocalTimeISOString } from '../utils';

export class LineLabel extends Label {
  x1: number;
  y1: number;
  x2: number;
  y2: number;

  constructor({
    x1,
    y1,
    x2,
    y2,
    category = '',
    id = 0,
    scale = 1,
    offset = { x: 0, y: 0 },
    coordSystem = CoordSystemType.Image,
    timestamp,
    hash,
  }: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    category: string;
    id: number;
    scale: number;
    offset: { x: number; y: number };
    coordSystem: CoordSystemType;
    timestamp?: string;
    hash?: string;
  }) {
    const labelType = LabelType.Line;
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
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  public static newFromCanvasObject = ({
    obj,
    scale,
    offset,
    timestamp,
    hash,
  }: {
    obj: fabric.Object;
    scale: number;
    offset: { x: number; y: number };
    timestamp?: string;
    hash?: string;
  }) => {
    const {
      x1,
      y1,
      x2,
      y2,
      category,
      id,
      timestamp: timestamp_,
      hash: hash_,
    } = obj as any;

    return new LineLabel({
      x1,
      y1,
      x2,
      y2,
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
    new LineLabel({
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
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
    const { x: cx1, y: cy1 } = super._toCanvasCoordSystem(scale, offset, {
      x: this.x1,
      y: this.y1,
    });
    const { x: cx2, y: cy2 } = super._toCanvasCoordSystem(scale, offset, {
      x: this.x2,
      y: this.y2,
    });

    const t = inplace ? this : this.clone();

    t.x1 = cx1;
    t.y1 = cy1;
    t.x2 = cx2;
    t.y2 = cy2;
    t.scale = scale;
    t.offset = offset;
    t.coordSystem = CoordSystemType.Canvas;
    return t;
  };

  toImageCoordSystem = (inplace = true) => {
    const { x: ix1, y: iy1 } = super._toImageCoordSystem({
      x: this.x1,
      y: this.y1,
    });
    const { x: ix2, y: iy2 } = super._toImageCoordSystem({
      x: this.x2,
      y: this.y2,
    });

    const t = inplace ? this : this.clone();

    t.x1 = ix1;
    t.y1 = iy1;
    t.x2 = ix2;
    t.y2 = iy2;
    t.scale = 1;
    t.offset = { x: 0, y: 0 };
    t.coordSystem = CoordSystemType.Image;
    return t;
  };

  // /**
  //  * generate fabric objects from the label
  //  * @param color the color of the category
  //  * @param needText is it need to show the text
  //  * @returns
  //  */
  // getFabricObjects(color: string, needText: boolean = true) {
  //   const {
  //     line: { x, y, _x, _y },
  //     id,
  //     category,
  //     labelType,
  //     timestamp,
  //     hash,
  //   } = this;

  //   const line = new fabric.Line([x, y, _x, _y], {
  //     ...LINE_DEFAULT_CONFIG,
  //     stroke: color,
  //   });

  //   const endpoints = [
  //     [x, y],
  //     [_x, _y],
  //   ].map(([x, y], _id) => {
  //     const endpoint = new fabric.Circle({
  //       ...POINT_DEFAULT_CONFIG,
  //       left: x,
  //       top: y,
  //       fill: color,
  //       stroke: TRANSPARENT,
  //     });
  //     endpoint.setOptions({ _id, lines: [line] });
  //     return endpoint;
  //   });

  //   line.setOptions({ endpoints });

  //   const topPoint = deepClone(endpoints).sort((a, b) => a.top! - b.top!)[0];
  //   const textbox = new fabric.Textbox(id.toString(), {
  //     ...TEXTBOX_DEFAULT_CONFIG,
  //     left: topPoint.left!,
  //     top: topPoint.top! - RADIUS,
  //     originX: 'center',
  //     originY: 'bottom',
  //     backgroundColor: color,
  //   });

  //   const products = needText
  //     ? [textbox, line, ...endpoints]
  //     : [line, ...endpoints];
  //   products.forEach((obj) =>
  //     obj.setOptions({ labelType, category, id, timestamp, hash })
  //   );
  //   return products;
  // }
}
