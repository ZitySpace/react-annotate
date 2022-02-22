import { RADIUS, STROKE_WIDTH } from '../interfaces/config'
import { Label, LabelType } from '../classes/Label'

/**
 * Judge that is the label invalid
 * @param obj target object
 * @param labelType 'Rect' | 'Line'
 * @returns is the obj invalid
 */
export const isInvalid = (obj: any, labelType: LabelType | null) => {
  return labelType === LabelType.Rect
    ? obj.width <= STROKE_WIDTH || obj.height <= STROKE_WIDTH
    : labelType === LabelType.Line
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

/**
 *  Group annotations by given property
 * @param annotations annotation list
 * @param property target property
 * @returns grouped annotations
 */
export const groupBy = (annotations: Label[], property: string) => {
  const groupedAnnosObj = annotations.reduce(
    (groupedAnnos: Object, theAnno: Label) => {
      if (!groupedAnnos[theAnno[property]]) groupedAnnos[theAnno[property]] = []
      groupedAnnos[theAnno[property]].push(theAnno)
      return groupedAnnos
    },
    {}
  )

  return Object.entries(groupedAnnosObj)
}

/**
 * Get the value which repeat the most
 * @param array target array
 * @returns value which repeat the most
 */
export const mostRepeatedValue = (array: any[]) =>
  array.sort(
    (a, b) =>
      array.filter((v) => v === a).length - array.filter((v) => v === b).length
  )[0]
