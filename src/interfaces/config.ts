export const IS_TOUCH_SCREEN =
  'ontouchstart' in window ||
  (navigator as any).maxTouchPoints > 0 ||
  (navigator as any).msMaxTouchPoints > 0

export const STROKE_WIDTH = 2

export const RADIUS = 3

export const NEW_CATEGORY_NAME = 'new_category'

export const TRANSPARENT = 'rgba(255,0,0,0)'

export const DEFAULT_COLOR = 'rgba(0,0,0,1)'

export const MAX_FONT_SIZE = 14

export const CANVAS_CONFIG: fabric.ICanvasOptions = {
  defaultCursor: 'default',
  selection: false,
  uniformScaling: false,
  perPixelTargetFind: true,
  targetFindTolerance: RADIUS + STROKE_WIDTH
}

export const POINT_DEFAULT_CONFIG: fabric.ICircleOptions = {
  originX: 'center',
  originY: 'center',
  selectable: !IS_TOUCH_SCREEN,
  hasControls: false,
  hasBorders: false,
  // hoverCursor: 'crosshair',
  // moveCursor: 'crosshair',
  strokeWidth: STROKE_WIDTH,
  fill: TRANSPARENT,
  radius: RADIUS
}

export const LINE_DEFAULT_CONFIG: fabric.ILineOptions = {
  originX: 'center',
  originY: 'center',
  hasControls: false,
  hasBorders: false,
  hoverCursor: 'default',
  strokeWidth: STROKE_WIDTH,
  strokeUniform: true,
  selectable: false
}

export const RECT_DEFAULT_CONFIG: fabric.IRectOptions | any = {
  originX: 'left',
  originY: 'top',
  hasBorders: false,
  _controlsVisibility: { mtr: false },
  selectable: !IS_TOUCH_SCREEN,
  lockRotation: true,
  fill: TRANSPARENT,
  strokeWidth: STROKE_WIDTH,
  strokeUniform: true,
  noScaleCache: false,
  cornerSize: 8,
  transparentCorners: false
}

export const POLYGON_DEFAULT_CONFIG: fabric.IPolylineOptions = {
  originX: 'left',
  originY: 'top',
  hasBorders: false,
  hasControls: false,
  hoverCursor: 'default',
  lockMovementX: true,
  lockMovementY: true,
  lockRotation: true,
  selectable: true,
  fill: TRANSPARENT,
  strokeWidth: STROKE_WIDTH,
  strokeUniform: true,
  noScaleCache: false,
  opacity: 0.3
}

export const TEXTBOX_DEFAULT_CONFIG: fabric.ITextboxOptions = {
  fill: 'black',
  selectable: false,
  hoverCursor: 'default',
  fontSize: RADIUS * 2
}
