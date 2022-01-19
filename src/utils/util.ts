import { RADIUS, STROKE_WIDTH } from '../interface/config'

/**
 * Judge that is the label invalid
 * @param obj target object
 * @param labelType 'Rect' | 'Line'
 * @returns is the obj invalid
 */
export const isInvalid = (obj: any, labelType: string | null) => {
  return labelType === 'Rect'
    ? obj.width <= STROKE_WIDTH || obj.height <= STROKE_WIDTH
    : labelType === 'Line'
    ? obj.endpoints[0]
        .getPointByOrigin()
        .distanceFrom(obj.endpoints[1].getPointByOrigin()) <
      (RADIUS + STROKE_WIDTH) * 2
    : false
}

/**
 * Determine whether the event is a touch event
 * @param event Mouse listeners catched event detail
 * @returns
 */
export const isTouchEvent = (event: React.TouchEvent | React.MouseEvent) =>
  // safari and firefox has no TouchEvent
  typeof TouchEvent !== 'undefined' && event instanceof TouchEvent
