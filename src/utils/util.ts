import { Radius, StrokeWidth } from '../interface/config'
import { getDistance } from './math'

/**
 *
 * @param obj target object
 * @param labelType 'Rect' | 'Line'
 * @returns is the obj invalid
 */
export const isInvalid = (obj: any, labelType: string | null) => {
  return labelType === 'Rect'
    ? obj.width <= StrokeWidth || obj.height <= StrokeWidth
    : labelType === 'Line'
    ? getDistance(
        ...obj.endpoints.map((circle: any) => circle.getPointByOrigin())
      ) <
      (Radius + StrokeWidth) * 2
    : false
}
