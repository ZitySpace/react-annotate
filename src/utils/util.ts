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
 * Set endpoint's corresponding line's position
 * @param endpoint Line's one endpoint
 */
export const setLinePosition = (endpoint: fabric.Circle) => {
  const { left, top, line, _id } = endpoint as any
  if (line && _id) {
    line.set({
      [`x${_id}`]: left - STROKE_WIDTH / 2,
      [`y${_id}`]: top - STROKE_WIDTH / 2
    })
  }
}
