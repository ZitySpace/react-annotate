import { fabric } from 'fabric'
import { MutableRefObject, useMemo, useRef } from 'react'
import { Dimension } from '../interface/basic'
import { TRANSPARENT } from '../interface/config'
import { Point } from '../label/PointLabel'
import { getBetween } from '../utils/math'
import { isTouchEvent } from '../utils/util'

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
  // TODO: remove this
  let nothing: any = { imageDims, boundary, offset, scale }
  nothing = !nothing

  const onDrawObj = useRef<fabric.Object>(null)
  const lastPosition = useRef<Point>({ x: 0, y: 0 })
  const isPanning = useRef<boolean>(false)
  const isDrawingStarted = useRef<boolean>(false)
  const canvas = canvasRef.current!

  const setZoomAndGetNewZoom = useMemo(
    () => (evt: any) => {
      const { deltaY: delta, offsetX, offsetY } = evt
      const zoom = canvas.getZoom()
      const newZoom = getBetween(zoom * 0.999 ** delta, 0.01, 20)
      canvas.zoomToPoint(new fabric.Point(offsetX, offsetY), newZoom)
      return newZoom
    },
    [canvas]
  )

  const setViewport = useMemo(
    () =>
      ({ zoom, offset = { x: 0, y: 0 } }: { zoom: number; offset?: Point }) => {
        const { w, h } = canvasDims
        const { x, y } = offset
        const vpt = canvas.viewportTransform as number[]
        if (zoom < 1) {
          vpt[4] = (w * (1 - zoom)) / 2
          vpt[5] = (h * (1 - zoom)) / 2
        } else {
          vpt[4] = getBetween(vpt[4] + x, w * (1 - zoom), 0)
          vpt[5] = getBetween(vpt[5] + y, h * (1 - zoom), 0)
        }
        canvas.requestRenderAll()
      },
    [canvas, canvasDims]
  )

  const listeners = {
    ...useMemo(
      () => ({
        'mouse:wheel': (e: fabric.IEvent<WheelEvent>) => {
          const zoom = setZoomAndGetNewZoom(e.e)
          setViewport({ zoom })
        },
        'mouse:out': (e: fabric.IEvent) => {
          const obj = e.target as any
          if (obj?.type === 'circle')
            obj.set({
              fill: TRANSPARENT,
              stroke: obj.color
            })
          canvas.renderAll()
        }
      }),
      [canvas]
    ),
    ...useMemo(
      () => ({
        'mouse:down': (e: fabric.IEvent<MouseEvent>) => {
          if (onDrawObj.current) return
          // TODO: draw
          else {
            const evt = e.e as any
            const { clientX, clientY } = isTouchEvent(evt)
              ? evt.touches[0]
              : evt
            lastPosition.current = { x: clientX, y: clientY }

            const selectedObj = canvas.getActiveObject()
            isPanning.current = !selectedObj
          }
        },
        'mouse:move': (e: fabric.IEvent<MouseEvent>) => {
          if (isDrawingStarted.current) return
          // TODO: draw
          else if (isPanning.current) {
            const { e: evt } = e as any
            const { clientX: x, clientY: y } = isTouchEvent(evt)
              ? evt.touches[0]
              : evt
            const { x: lastX, y: lastY } = lastPosition.current
            const offset = { x: x - lastX, y: y - lastY }
            lastPosition.current = { x, y }

            const zoom = canvas.getZoom()
            setViewport({ zoom, offset })
          }
        },
        'mouse:up': () => {
          if (isDrawingStarted.current) return
          // TODO: draw
          else if (isPanning.current) {
            canvas.setViewportTransform(canvas.viewportTransform as number[])
            isPanning.current = false
          }
        }
      }),
      [canvas]
    )
  }

  return { ...listeners }
}
