import { checkImg, XImg } from '../components/Icons';

export const IS_TOUCH_SCREEN = 'ontouchstart' in window;
// || (navigator as any).maxTouchPoints > 0
// || (navigator as any).msMaxTouchPoints > 0

export const STROKE_WIDTH = 2;
export const RADIUS = 4;
export const NEW_CATEGORY_NAME = 'new_category';
export const TRANSPARENT = 'rgba(255,0,0,0)';
export const DEFAULT_COLOR = 'rgba(0,0,0,1)';
export const MAX_FONT_SIZE = 14;

// config snippets
export const ANCHOR_CENTER = { originX: 'center', originY: 'center' };
export const ANCHOR_LEFT_TOP = { originX: 'left', originY: 'top' };
export const NO_BORDER = { hasControls: false, hasBorders: false };
export const HOLLOW = { fill: TRANSPARENT, strokeWidth: STROKE_WIDTH };
export const READ_ONLY = { selectable: false, evented: false };
export const NOT_DIRECTED_OPERATABLE = {
  hoverCursor: 'default',
  lockMovementX: true,
  lockMovementY: true,
  lockRotation: true,
};

export const CANVAS_CONFIG: fabric.ICanvasOptions = {
  defaultCursor: 'default',
  selection: false,
  uniformScaling: false,
  fireRightClick: true,
  stopContextMenu: true,
};

export const POINT_DEFAULT_CONFIG: fabric.ICircleOptions = {
  ...ANCHOR_CENTER,
  ...NO_BORDER,
  selectable: !IS_TOUCH_SCREEN,
  radius: RADIUS,
  strokeWidth: STROKE_WIDTH,
  perPixelTargetFind: false,
};

export const LINE_DEFAULT_CONFIG: fabric.ILineOptions = {
  ...ANCHOR_CENTER,
  ...NO_BORDER,
  ...NOT_DIRECTED_OPERATABLE,
  strokeWidth: STROKE_WIDTH,
  selectable: true,
  perPixelTargetFind: true,
};

export const RECT_DEFAULT_CONFIG: fabric.IRectOptions | any = {
  ...ANCHOR_LEFT_TOP,
  ...HOLLOW,
  hasBorders: false,
  _controlsVisibility: { mtr: false },
  selectable: !IS_TOUCH_SCREEN,
  strokeUniform: true,
  noScaleCache: false,
  cornerSize: 8,
  transparentCorners: false,
  perPixelTargetFind: true,
};

export const POLYGON_DEFAULT_CONFIG: fabric.IPolylineOptions = {
  ...ANCHOR_LEFT_TOP,
  ...NO_BORDER,
  ...HOLLOW,
  ...NOT_DIRECTED_OPERATABLE,
  perPixelTargetFind: true,
  selectable: true,
};

export const POLYLINE_DEFAULT_OPTIONS: fabric.IPolylineOptions = {
  ...ANCHOR_LEFT_TOP,
  ...NO_BORDER,
  ...HOLLOW,
  ...NOT_DIRECTED_OPERATABLE,
  ...READ_ONLY,
};

export const TEXTBOX_DEFAULT_CONFIG: fabric.ITextboxOptions = {
  fill: 'black',
  selectable: false,
  hoverCursor: 'default',
  fontSize: 14,
};

export const BREAKPOINT_DEFAULT_OPTIONS: fabric.ICircleOptions = {
  ...POINT_DEFAULT_CONFIG,
  ...READ_ONLY,
  type: 'breakpoint',
};

export const deleteCursor = `url('${XImg}'), auto`;
export const checkCursor = `url('${checkImg}'), auto`;
