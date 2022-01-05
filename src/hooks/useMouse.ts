import { fabric } from 'fabric'
import { MutableRefObject, useRef } from 'react'
import { Dimension } from '../interface/basic'
import { Transparent } from '../interface/config'
import { Point } from '../label/PointLabel'
import { getBetween } from '../utils/math'

export const useMouse = ({
  canvasRef,
  canvasDimsRef,
  onDrawObjRef
}: {
  canvasRef: MutableRefObject<fabric.Canvas | null>
  canvasDimsRef: MutableRefObject<Dimension>
  onDrawObjRef: MutableRefObject<fabric.Object | null>
}) => {
  // const prevMousePosition = useRef<Point>({ x: 0, y: 0 })
  const mousePosition = useRef<Point>({ x: 0, y: 0 })

  const mouseEvents = {
    onWheel: (e: fabric.IEvent<WheelEvent>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const { w, h } = canvasDimsRef.current
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
    },

    onOver: (e: fabric.IEvent<WheelEvent>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const obj = e.target as any
      if (obj?.type === 'circle')
        obj.set({
          fill: Transparent,
          stroke: obj.color
        })
      canvas.renderAll()
    },

    onOut: (e: fabric.IEvent<WheelEvent>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const obj = e.target as any
      const onDrawObj = onDrawObjRef.current as any

      if (obj?.type === 'circle' && (!onDrawObj || obj.id !== onDrawObj.id))
        obj.set({
          fill: obj.color,
          stroke: Transparent
        })

      canvas.renderAll()
    }
  }

  return { mousePosition, mouseEvents }
}
