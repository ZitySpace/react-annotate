import { RADIUS, STROKE_WIDTH } from '../interface/config'
import { Label } from '../label/Label'

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

/**
 * Intercept the string and use ... to replace
 * @param str target string
 * @param len target length of origin string
 * @returns abbreviation
 */
export const getAbbreviation = (str: string, len: number = 7) =>
  str.slice(0, len) + (str.length > len ? '...' : '')

/**
 *  Group annotations by given property
 * @param annotations annotation list
 * @param property target property
 * @returns grouped annotations
 */
export const groupBy = (annotations: Label[], property: string) => {
  return annotations.reduce((groupedAnnos: any, theAnno: Label) => {
    if (!groupedAnnos[theAnno[property]]) {
      groupedAnnos[theAnno[property]] = []
    }
    groupedAnnos[theAnno[property]].push(theAnno)
    return groupedAnnos
  }, {})
}
