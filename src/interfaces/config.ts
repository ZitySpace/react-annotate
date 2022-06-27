import { XImg } from '../components/Icons';

export const IS_TOUCH_SCREEN = 'ontouchstart' in window;
// || (navigator as any).maxTouchPoints > 0
// || (navigator as any).msMaxTouchPoints > 0

export const STROKE_WIDTH = 2;

export const RADIUS = 4;

export const NEW_CATEGORY_NAME = 'new_category';

export const TRANSPARENT = 'rgba(255,0,0,0)';

export const DEFAULT_COLOR = 'rgba(0,0,0,1)';

export const MAX_FONT_SIZE = 14;

export const CANVAS_CONFIG: fabric.ICanvasOptions = {
  defaultCursor: 'default',
  selection: false,
  uniformScaling: false,
  fireRightClick: true,
  stopContextMenu: true,
};

export const POINT_DEFAULT_CONFIG: fabric.ICircleOptions = {
  originX: 'center',
  originY: 'center',
  selectable: !IS_TOUCH_SCREEN,
  hasControls: false,
  hasBorders: false,
  strokeWidth: STROKE_WIDTH,
  fill: TRANSPARENT,
  radius: RADIUS,
  perPixelTargetFind: false,
};

export const LINE_DEFAULT_CONFIG: fabric.ILineOptions | any = {
  originX: 'center',
  originY: 'center',
  hasControls: false,
  hasBorders: false,
  hoverCursor: 'default',
  strokeWidth: STROKE_WIDTH,
  strokeUniform: true,
  lockMovementX: true,
  lockMovementY: true,
  selectable: true,
  perPixelTargetFind: true,
  targetFindTolerance: RADIUS + STROKE_WIDTH,
};

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
  transparentCorners: false,
  perPixelTargetFind: true,
};

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
  opacity: 1,
  perPixelTargetFind: true,
};

export const POLYLINE_DEFAULT_OPTIONS: fabric.IPolylineOptions = {
  originX: 'left',
  originY: 'top',
  hasBorders: false,
  hasControls: false,
  hoverCursor: 'default',
  lockMovementX: true,
  lockMovementY: true,
  lockRotation: true,
  selectable: false,
  fill: TRANSPARENT,
  evented: false,
};

export const BREAKPOINT_DEFAULT_OPTIONS: fabric.ICircleOptions = {
  ...POINT_DEFAULT_CONFIG,
  type: 'breakpoint',
  selectable: false,
};

export const TEXTBOX_DEFAULT_CONFIG: fabric.ITextboxOptions = {
  fill: 'black',
  selectable: false,
  hoverCursor: 'default',
  fontSize: 14,
};

export const deleteCursor = `url('${XImg}'), auto`;
