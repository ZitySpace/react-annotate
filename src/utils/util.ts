import { Radius, StrokeWidth } from '../interface/config'

/**
 * Judge that is the label invalid
 * @param obj target object
 * @param labelType 'Rect' | 'Line'
 * @returns is the obj invalid
 */
export const isInvalid = (obj: any, labelType: string | null) => {
  return labelType === 'Rect'
    ? obj.width <= StrokeWidth || obj.height <= StrokeWidth
    : labelType === 'Line'
    ? obj.endpoints[0]
        .getPointByOrigin()
        .distanceFrom(obj.endpoints[1].getPointByOrigin()) <
      (Radius + StrokeWidth) * 2
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
      [`x${_id}`]: left - StrokeWidth / 2,
      [`y${_id}`]: top - StrokeWidth / 2
    })
  }
}
