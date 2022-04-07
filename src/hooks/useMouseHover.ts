import { isEndpoint, isPoint, isPolygonLine } from '../utils/label'
import { UseFocusReturnProps } from './useFocus'

const setHoverEffectOfEndpoint = (obj: fabric.Circle) => {
  if (isPoint(obj) || isEndpoint(obj))
    obj.set({
      fill: obj.stroke,
      stroke: obj.fill as string
    })
}

export const useMouseHover = ({ focus }: { focus: UseFocusReturnProps }) => ({
  'mouse:over': (e: fabric.IEvent<MouseEvent>) => {
    const obj = e.target as fabric.Object
    if (!obj) return

    const { canvas } = obj
    setHoverEffectOfEndpoint(obj as fabric.Circle)
    focus.isFocused(obj as any) &&
      isPolygonLine(obj) &&
      canvas?.add((obj as any).midpoint)

    canvas?.requestRenderAll()
  },
  'mouse:out': (e: fabric.IEvent<MouseEvent>) => {
    const obj = e.target as fabric.Object
    if (!obj) return

    const { canvas } = obj
    setHoverEffectOfEndpoint(obj as fabric.Circle)
    if (isPolygonLine(obj)) {
      const isMoveToMidpoint = (e as any).nextTarget === (obj as any).midpoint
      if (!isMoveToMidpoint) canvas?.remove((obj as any).midpoint)
    } else if (obj.type === 'midpoint') canvas?.remove(obj)

    canvas?.requestRenderAll()
  }
})
