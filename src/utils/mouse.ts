export const isTouchEvt = (
  event: React.TouchEvent | React.MouseEvent
): event is React.TouchEvent => {
  // safari and firefox has no TouchEvent
  return typeof TouchEvent !== 'undefined' && event instanceof TouchEvent
}
