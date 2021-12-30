export const StrokeWidth = 1.5

export const radius = 3

export const isTouchScreen =
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
  selectable: !isTouchScreen,
  originX: 'center',
  originY: 'center',
  radius: radius
}

export const TextboxDefaultConfig: fabric.ITextboxOptions = {
  fill: 'black',
  selectable: false,
  hoverCursor: 'default',
  fontSize: radius * 2
}
