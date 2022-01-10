import { MutableRefObject, useRef } from 'react'
import { Label } from '../interface/basic'
import { setLinePosition } from '../utils/util'
import { State } from './stateStack'

export const useCanvas = ({
  isAnnosVisible,
  categoryColorsRef
}: {
  isAnnosVisible: boolean
  categoryColorsRef: MutableRefObject<any>
}) => {
  const canvasRef = useRef<fabric.Canvas | null>(null)
  const canvas = canvasRef.current
  const colors = categoryColorsRef.current

  // If canvas no null, mount listeners
  canvas &&
    canvas.off() &&
    canvas.on('object:moving', (e) => {
      setLinePosition(e.target as any)
    }) &&
    canvas.on('object:modified', () => {})

  const methods = {
    syncStateToCanvas(state: State, forceVisable: boolean = false) {
      if (!canvas) return
      canvas.remove(
        ...canvas.getObjects().filter((obj: any) => obj.type !== 'image')
      )
      state.forEach((anno: Label) => {
        const { categoryName } = anno
        const currentColor = colors[categoryName!]
        const visible = forceVisable || isAnnosVisible // && isFocused(categoryName, id))
        const fabricObjects = anno.getFabricObjects({ currentColor })
        canvas.add(
          ...Object.values(fabricObjects).map((obj: any) =>
            obj.set({ visible })
          )
        )
      })
    }
  }

  return { canvasRef, ...methods }
}
