/**
 * get legal values within the range
 * @param value the value to be determined
 * @param args lower bound and upper bound
 * @returns legal values within the range
 */
export function getBetween(value: number, ...args: number[]): number {
  return Math.min(Math.max(args[0], value), args[1])
}
