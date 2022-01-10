import { MutableRefObject } from 'react'
import { Label } from '../interface/basic'
// import { LineLabel } from '../label/LineLabel'
// import { PointLabel } from '../label/PointLabel'
// import { RectLabel } from '../label/RectLabel'
import { setLinePosition } from '../utils/util'
import { State } from './stateStack'

export const useCanvas = ({
  canvasRef,
  isAnnosVisible,
  categoryColorsRef
}: {
  canvasRef: MutableRefObject<fabric.Canvas | null>
  isAnnosVisible: boolean
  categoryColorsRef: MutableRefObject<any>
}) => {
  const canvas = canvasRef.current
  const colors = categoryColorsRef.current

  // const syncCanvasToState = () => {
  //   if (!canvas) return

  //   const allCanvasObjects = canvas.getObjects()
  //   const Rects = allCanvasObjects.filter(
  //     (obj: any) => obj.type === 'rect' && obj.labelType === 'Rect'
  //   )
  //   const Points = allCanvasObjects.filter(
  //     (obj: any) => obj.type === 'circle' && obj.labelType === 'Point'
  //   )
  //   const Lines = allCanvasObjects.filter(
  //     (obj: any) => obj.type === 'line' && obj.labelType === 'Line'
  //   )

  //   const nowState: Label[] = [
  //     ...Rects.map((obj: fabric.Rect) => {
  //       return RectLabel.fromFabricRect({
  //         obj,
  //         offset: offsetR.current,
  //         scale: scaleR.current
  //       })
  //     }),
  //     ...Points.map((obj: fabric.Circle) => {
  //       return PointLabel.fromFabricPoint({
  //         obj,
  //         offset: offsetR.current,
  //         scale: scaleR.current
  //       })
  //     }),
  //     ...Lines.map((obj: fabric.Line) => {
  //       return LineLabel.fromFabricLine({
  //         obj,
  //         offset: offsetR.current,
  //         scale: scaleR.current
  //       })
  //     })
  //   ]
  // }

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

  return { ...methods }
}
