import { fabric } from 'fabric'

/**
 * get legal values within the range
 * @param value the value to be determined
 * @param args lower bound and upper bound
 * @returns legal values within the range
 */
export function getBetween(value: number, ...args: number[]): number {
  return Math.min(Math.max(args[0], value), args[1])
}

/**
 * calculate the distance between two points
 * @param points two target points of type fabric.point
 * @returns distance between point_1 and point_2
 */
export function getDistance(...points: fabric.Point[]): number {
  return points[0].distanceFrom(points[1])
}
