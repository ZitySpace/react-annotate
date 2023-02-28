import { checkImg } from '../components/Icons';
import { TOriginX, TOriginY } from 'fabric/src/typedefs';

export const IS_TOUCH_SCREEN =
  typeof window !== 'undefined' && 'ontouchstart' in window;
// || (navigator as any).maxTouchPoints > 0
// || (navigator as any).msMaxTouchPoints > 0

export const STROKE_WIDTH = 2;
export const RADIUS = 4;
export const UNKNOWN_CATEGORY_NAME = 'UNKNOWN_CATEGORY';
export const TRANSPARENT = 'rgba(255,0,0,0)';
export const DEFAULT_COLOR = 'rgba(0,0,0,1)';
export const MAX_FONT_SIZE = 14;

// config snippets
export const ANCHOR_CENTER = {
  originX: 'center' as TOriginX,
  originY: 'center' as TOriginY,
};
export const ANCHOR_LEFT_TOP = {
  originX: 'left' as TOriginX,
  originY: 'top' as TOriginY,
};
export const NO_BORDER = { hasControls: false, hasBorders: false };
export const HOLLOW = { fill: TRANSPARENT, strokeWidth: STROKE_WIDTH };
export const NOT_DIRECTED_OPERATABLE = {
  hoverCursor: 'default',
  lockMovementX: true,
  lockMovementY: true,
  lockRotation: true,
};

export const CANVAS_CONFIG = {
  defaultCursor: 'default',
  selection: false,
  uniformScaling: false,
  targetFindTolerance: 5,
  fireRightClick: true,
  stopContextMenu: true,
};

export const POINT_DEFAULT_CONFIG = {
  ...ANCHOR_CENTER,
  ...NO_BORDER,
  selectable: !IS_TOUCH_SCREEN,
  radius: RADIUS,
  strokeWidth: STROKE_WIDTH,
  perPixelTargetFind: false,
};

export const LINE_DEFAULT_CONFIG = {
  ...ANCHOR_CENTER,
  ...NO_BORDER,
  strokeWidth: STROKE_WIDTH,
  selectable: true,
  perPixelTargetFind: true,
};

export const RECT_DEFAULT_CONFIG = {
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

export const POLYGON_DEFAULT_CONFIG = {
  ...ANCHOR_LEFT_TOP,
  ...NO_BORDER,
  ...HOLLOW,
  ...NOT_DIRECTED_OPERATABLE,
  perPixelTargetFind: true,
  selectable: true,
  fillRule: 'nonzero',
};

export const POLYLINE_DEFAULT_CONFIG = {
  ...ANCHOR_LEFT_TOP,
  ...NO_BORDER,
  ...HOLLOW,
  ...NOT_DIRECTED_OPERATABLE,
  perPixelTargetFind: true,
  selectable: true,
};

export const TEXTBOX_DEFAULT_CONFIG = {
  fill: 'black',
  selectable: false,
  hoverCursor: 'default',
  fontSize: 14,
};

export const checkCursor = `url('${checkImg}'), auto`;
