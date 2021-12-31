export const StrokeWidth = 1.5

export const Radius = 3

export const IsTouchScreen =
  'ontouchstart' in window ||
  (navigator as any).maxTouchPoints > 0 ||
  (navigator as any).msMaxTouchPoints > 0

export const NewCategoryName = 'new_category'

export const Transparent = 'rgba(255,0,0,0)'

export const PointDefaultConfig: fabric.ICircleOptions = {
  strokeWidth: StrokeWidth,
  fill: Transparent,
  hasControls: false,
  hasBorders: false,
  selectable: !IsTouchScreen,
  originX: 'center',
  originY: 'center',
  radius: Radius
}

export const LineDefaultConfig: fabric.ILineOptions = {
  strokeWidth: StrokeWidth,
  hasBorders: false,
  hasControls: false,
  strokeUniform: true,
  selectable: false,
  hoverCursor: 'default',
  visible: true
}

export const TextboxDefaultConfig: fabric.ITextboxOptions = {
  fill: 'black',
  selectable: false,
  hoverCursor: 'default',
  fontSize: Radius * 2
}
