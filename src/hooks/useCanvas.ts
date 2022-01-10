import { MutableRefObject } from 'react'
import { Dimension, Label } from '../interface/basic'
import { Point } from '../label/PointLabel'
import { LineLabel } from '../label/LineLabel'
import { PointLabel } from '../label/PointLabel'
import { RectLabel } from '../label/RectLabel'
import { setLinePosition } from '../utils/util'

export const useCanvas = ({
  canvasRef,
  isAnnosVisible,
  categoryColorsRef,
  imageDims,
  canvasDims,
  boundary,
  offset,
  scale,
  pushState
}: {
  canvasRef: MutableRefObject<fabric.Canvas | null>
  isAnnosVisible: boolean
  categoryColorsRef: MutableRefObject<any>
  imageDims: Dimension
  canvasDims: Dimension
  boundary: { x: number[]; y: number[] } | null
  offset: Point
  scale: number
  pushState?: Function
}) => {
  const canvas = canvasRef.current
  // const colors = categoryColorsRef.current
  let nothing: any = {
    isAnnosVisible,
    categoryColorsRef,
    imageDims,
    canvasDims,
    boundary
  }
  nothing = 0
  console.log(nothing)

  const syncCanvasToState = () => {
    if (!canvas) return

    const allCanvasObjects = canvas.getObjects()
    const Rects = allCanvasObjects.filter(
      (obj: any) => obj.type === 'rect' && obj.labelType === 'Rect'
    )
    const Points = allCanvasObjects.filter(
      (obj: any) => obj.type === 'circle' && obj.labelType === 'Point'
    )
    const Lines = allCanvasObjects.filter(
      (obj: any) => obj.type === 'line' && obj.labelType === 'Line'
    )

    const nowState: Label[] = [
      ...Rects.map((obj: fabric.Rect) => {
        return RectLabel.fromFabricRect({ obj, offset, scale })
      }),
      ...Points.map((obj: fabric.Circle) => {
        return PointLabel.fromFabricPoint({ obj, offset, scale })
      }),
      ...Lines.map((obj: fabric.Line) => {
        return LineLabel.fromFabricLine({ obj, offset, scale })
      })
    ]

    pushState && pushState(nowState)
  }

  // If canvas no null, mount listeners
  canvas &&
    canvas.off() &&
    canvas.on('object:moving', (e) => {
      setLinePosition(e.target as any)
    }) &&
    canvas.on('object:modified', () => {
      syncCanvasToState()
    })

  const methods = {}

  return { ...methods }
}
