interface Point {
  x: number
  y: number
}

interface Line extends Point {
  _x: number
  _y: number
}

interface Rect extends Point {
  w: number
  y: number
}

interface Polygon extends Array<Point> {}

interface PointLabel extends Point {
  categoryName: string | null
  categoryId: number | null
}

interface LineLabel extends Line {
  categoryName: string | null
  categoryId: number | null
}

interface RectLabel extends Rect {
  categoryName: string | null
  categoryId: number | null
}

interface PolygonLabel extends Polygon {
  categoryName: string | null
  categoryId: number | null
}
