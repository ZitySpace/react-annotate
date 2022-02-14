export const IS_TOUCH_SCREEN =
  'ontouchstart' in window ||
  (navigator as any).maxTouchPoints > 0 ||
  (navigator as any).msMaxTouchPoints > 0

export const STROKE_WIDTH = 1.5

export const RADIUS = 3

export const NEW_CATEGORY_NAME = 'new_category'

export const TRANSPARENT = 'rgba(255,0,0,0)'

export const POINT_DEFAULT_CONFIG: fabric.ICircleOptions = {
  strokeWidth: STROKE_WIDTH,
  fill: TRANSPARENT,
  hasControls: false,
  hasBorders: false,
  selectable: !IS_TOUCH_SCREEN,
  originX: 'center',
  originY: 'center',
  radius: RADIUS
}

export const LINE_DEFAULT_CONFIG: fabric.ILineOptions = {
  strokeWidth: STROKE_WIDTH,
  hasBorders: false,
  hasControls: false,
  strokeUniform: true,
  selectable: false,
  hoverCursor: 'default',
  visible: true
}

export const RECT_DEFAULT_CONFIG: fabric.IRectOptions | any = {
  lockRotation: true,
  fill: TRANSPARENT,
  strokeWidth: STROKE_WIDTH,
  noScaleCache: false,
  strokeUniform: true,
  hasBorders: false,
  cornerSize: 8,
  transparentCorners: false,
  perPixelTargetFind: true,
  selectable: !IS_TOUCH_SCREEN,
  _controlsVisibility: { mtr: false }
}

export const TEXTBOX_DEFAULT_CONFIG: fabric.ITextboxOptions = {
  fill: 'black',
  selectable: false,
  hoverCursor: 'default',
  fontSize: RADIUS * 2
}
