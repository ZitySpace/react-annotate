import { fabric } from 'fabric'
import { MutableRefObject, useMemo } from 'react'
import { Dimension } from '../interface/basic'
import { Point } from '../label/PointLabel'
import { getBetween } from '../utils/math'

export const useMouse = ({
  canvasRef,
  imageDims,
  canvasDims,
  boundary,
  offset,
  scale
}: {
  canvasRef: MutableRefObject<fabric.Canvas | null>
  imageDims: Dimension
  canvasDims: Dimension
  boundary: { x: number[]; y: number[] }
  offset: Point
  scale: number
}) => {
  console.log(imageDims, canvasDims, boundary, offset, scale) // TODO: remove
  const canvas = canvasRef.current!

  const listeners = useMemo(
    () => ({
      'mouse:wheel': (e: fabric.IEvent<WheelEvent>) => {
        const { w, h } = canvasDims
        const { e: evt } = e
        const delta = evt.deltaY

        evt.preventDefault()
        evt.stopPropagation()

        const zoom = getBetween(canvas.getZoom() * 0.999 ** delta, 0.01, 20)
        canvas.zoomToPoint(
          new fabric.Point((evt as any).offsetX, (evt as any).offsetY),
          zoom
        )

        const vpt: any = canvas.viewportTransform
        if (zoom < 1) {
          vpt[4] = (w * (1 - zoom)) / 2
          vpt[5] = (h * (1 - zoom)) / 2
        } else {
          vpt[4] = getBetween(vpt[4], w * (1 - zoom), 0)
          vpt[5] = getBetween(vpt[5], h * (1 - zoom), 0)
        }
      }
    }),
    [canvas]
  )

  return { ...listeners }
}
