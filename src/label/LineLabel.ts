/* eslint-disable no-unused-vars */
import { fabric } from 'fabric'
import {
  LINE_DEFAULT_CONFIG,
  POINT_DEFAULT_CONFIG,
  RADIUS,
  STROKE_WIDTH,
  TEXTBOX_DEFAULT_CONFIG,
  TRANSPARENT
} from '../interface/config'
import { Point } from './PointLabel'

interface Line extends Point {
  _x: number
  _y: number
  distance: number
}

export class LineLabel implements Line {
  readonly type = 'Line'
  _x: number
  _y: number
  distance: number
  x: number
  y: number
  scale: number
  offset: Point
  strokeWidth: number
  id: number
  categoryId: number | null
  categoryName: string | null
  color: string

  static fromFabricLine({
    obj,
    offset,
    scale
  }: {
    obj: fabric.Line
    offset: Point
    scale: number
  }): LineLabel {
    return new this({
      x: obj.x1! + STROKE_WIDTH / 2,
      y: obj.y1! + STROKE_WIDTH / 2,
      _x: obj.x2! + STROKE_WIDTH / 2,
      _y: obj.y2! + STROKE_WIDTH / 2,
      id: (obj as any).id,
      categoryName: (obj as any).categoryName,
      strokeWidth: obj.strokeWidth,
      color: (obj as any).color,
      offset,
      scale
    })
  }

  constructor({
    x,
    y,
    _x,
    _y,
    id,
    categoryId,
    categoryName,
    offset,
    scale,
    strokeWidth,
    color
  }: {
    x: number
    y: number
    _x: number
    _y: number
    id: number
    categoryId?: number
    categoryName?: string
    offset?: Point
    scale?: number
    strokeWidth?: number
    color: string
  }) {
    this.x = x
    this.y = y
    this._x = _x
    this._y = _y
    this.distance = Math.sqrt(
      Math.pow(Math.abs(x - _x), 2) + Math.pow(Math.abs(y - _y), 2)
    )
    this.id = id
    this.categoryId = categoryId || null
    this.categoryName = categoryName || null
    this.offset = offset || { x: 0, y: 0 }
    this.scale = scale || 1
    this.strokeWidth = strokeWidth || 1.5
    this.color = color
  }

  scaleTransform(scale: number, offset: Point) {
    if (this.scale !== 1 || this.offset.x || this.offset.y) this.origin()
    this.scale = scale
    this.offset = offset
    this.x = this.x * scale + offset.x - this.strokeWidth
    this.y = this.y * scale + offset.y - this.strokeWidth
    this._x = this._x * scale + offset.x - this.strokeWidth
    this._y = this._y * scale + offset.y - this.strokeWidth
    return this
  }

  origin() {
    this.x = (this.x - this.offset.x + this.strokeWidth) / this.scale
    this.y = (this.y - this.offset.y + this.strokeWidth) / this.scale
    this._x = (this._x - this.offset.x + this.strokeWidth) / this.scale
    this._y = (this._y - this.offset.y + this.strokeWidth) / this.scale
    this.scale = 1
    this.offset = { x: 0, y: 0 }
    return this
  }

  getOrigin() {
    return {
      ...this,
      x: (this.x - this.offset.x + this.strokeWidth) / this.scale,
      y: (this.y - this.offset.y + this.strokeWidth) / this.scale,
      _x: (this._x - this.offset.x + this.strokeWidth) / this.scale,
      _y: (this._y - this.offset.y + this.strokeWidth) / this.scale
    }
  }

  getFabricObjects({
    currentColor,
    visible = true
  }: {
    currentColor?: string
    visible?: boolean
  }) {
    const { x, y, _x, _y, color: oriColor, id, categoryName } = this
    const color = currentColor || oriColor
    const line = new fabric.Line(
      [x, y, _x, _y].map((coord) => coord - STROKE_WIDTH / 2),
      {
        ...LINE_DEFAULT_CONFIG,
        stroke: color,
        visible
      }
    )

    const endpoints = [
      [x, y],
      [_x, _y]
    ].map((coord, _id) => {
      const endpoint = new fabric.Circle({
        ...POINT_DEFAULT_CONFIG,
        left: coord[0],
        top: coord[1],
        fill: color,
        stroke: TRANSPARENT,
        visible
      })
      endpoint.setOptions({
        id,
        _id: _id + 1,
        categoryName,
        color,
        line,
        labelType: 'Line'
      })
      return endpoint
    })

    const topPoint = endpoints.sort((a, b) => a.top! - b.top!)[0]
    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: topPoint.left!,
      top: topPoint.top! - RADIUS,
      originX: 'center',
      originY: 'bottom',
      backgroundColor: currentColor || color,
      visible
    })
    textbox.setOptions({ id, categoryName, labelType: 'Line' })
    line.setOptions({ id, categoryName, color, endpoints, labelType: 'Line' })
    return { line, textbox, point1: endpoints[0], point2: endpoints[1] }
  }

  static newFabricObjects({
    position,
    id,
    categoryName,
    color
  }: {
    position: Point
    id: number
    categoryName: string
    color: string
  }) {
    const { x, y } = position
    const line = new fabric.Line(
      [x, y, x, y].map((coord) => coord - STROKE_WIDTH / 2),
      {
        ...LINE_DEFAULT_CONFIG,
        stroke: color
      }
    )
    const endpoints = [...Array(2).keys()].map((_id) => {
      const endpoint = new fabric.Circle({
        ...POINT_DEFAULT_CONFIG,
        left: x,
        top: y,
        fill: color,
        stroke: TRANSPARENT
      })
      endpoint.setOptions({
        id,
        _id: _id + 1,
        categoryName,
        color,
        labelType: 'Line',
        line
      })
      return endpoint
    })
    line.setOptions({ id, categoryName, color, labelType: 'Line', endpoints })

    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      originX: 'center',
      originY: 'bottom',
      backgroundColor: color,
      visible: false
    })
    textbox.setOptions({ id, categoryName, labelType: 'Line' })
    return [line, ...endpoints, textbox]
  }
}
