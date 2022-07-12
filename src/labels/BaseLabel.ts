export enum LabelType {
  None = 'none',
  Point = 'point',
  Line = 'line',
  Box = 'box',
  Mask = 'mask',
}

export enum CoordSystemType {
  Image,
  Canvas,
}

export abstract class Label {
  readonly labelType: LabelType;
  category: string;
  id: number;
  scale: number;
  offset: { x: number; y: number };
  coordSystem: CoordSystemType;
  timestamp: string;
  hash: string;

  protected constructor({
    labelType,
    category,
    id,
    scale,
    offset,
    coordSystem,
    timestamp,
    hash,
  }: {
    labelType: LabelType;
    category: string;
    id: number;
    scale: number;
    offset: { x: number; y: number };
    coordSystem: CoordSystemType;
    timestamp: string;
    hash: string;
  }) {
    this.labelType = labelType;
    this.category = category;
    this.id = id;
    this.scale = scale;
    this.offset = offset;
    this.coordSystem = coordSystem;
    this.timestamp = timestamp;
    this.hash = hash;
  }

  protected _toCanvasCoordSystem(
    scale: number,
    offset: { x: number; y: number },
    coord: { x: number; y: number }
  ) {
    return this.coordSystem === CoordSystemType.Canvas
      ? {
          x: ((coord.x - this.offset.x) * scale) / this.scale + offset.x,
          y: ((coord.y - this.offset.y) * scale) / this.scale + offset.y,
        }
      : {
          x: coord.x * scale + offset.x,
          y: coord.y * scale + offset.y,
        };
  }

  protected _toImageCoordSystem(coord: { x: number; y: number }) {
    return this.coordSystem === CoordSystemType.Image
      ? { ...coord }
      : {
          x: (coord.x - this.offset.x) / this.scale,
          y: (coord.y - this.offset.y) / this.scale,
        };
  }

  abstract toCanvasCoordSystem(
    { scale, offset }: { scale: number; offset: { x: number; y: number } },
    inplace: boolean
  ): Label;

  abstract toImageCoordSystem(inplace: boolean): Label;

  abstract toCanvasObjects(color: string): fabric.Object[];
}
