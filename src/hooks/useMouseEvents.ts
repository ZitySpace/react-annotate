import { fabric } from 'fabric'
import { MutableRefObject, useMemo, useRef } from 'react'
import { Dimension } from '../interface/basic'
import { TRANSPARENT } from '../interface/config'
import { Point } from '../label/PointLabel'
import { getBetween } from '../utils/math'
import { isTouchEvt } from '../utils/mouse'

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
  const onDrawObjRef = useRef<fabric.Object>(null)
  const onDrawObj = onDrawObjRef.current
  const lastPositionRef = useRef<Point>({ x: 0, y: 0 })
  const isPanningRef = useRef<boolean>(false)
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
      },
      'mouse:over': (e: fabric.IEvent) => {
        const obj = e.target as any
        if (obj?.type === 'circle')
          obj.set({
            fill: TRANSPARENT,
            stroke: obj.color
          })
        canvas.renderAll()
      },
      // 'mouse:out': (e: fabric.IEvent<MouseEvent>) => {
      //   const obj = e.target as any
      //   const onDrawObj = onDrawObjRef.current as any

      //   if (obj?.type === 'circle' && (!onDrawObj || obj.id !== onDrawObj.id))
      //     obj.set({
      //       fill: obj.color,
      //       stroke: Transparent
      //     })

      //   canvas.renderAll()
      // },
      'mouse:down': (e: fabric.IEvent<MouseEvent>) => {
        if (onDrawObj) return
        else {
          const evt = e.e as any
          const { clientX, clientY } = isTouchEvt(evt) ? evt.touches[0] : evt
          lastPositionRef.current = { x: clientX, y: clientY }

          const selectedObj = canvas.getActiveObject()
          isPanningRef.current = !selectedObj
        }
      }
    }),
    [canvas]
  )

  return { ...listeners }
}
