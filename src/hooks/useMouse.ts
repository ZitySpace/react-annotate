import { usePinch } from '@use-gesture/react'
import { useEffect, useRef } from 'react'
import { Dimension } from '../classes/Geometry/Dimension'
import { Point } from '../classes/Geometry/Point'
import { getBetween, isTouchEvent } from '../utils'
import { isEndpoint, isPoint, isPolygonLine } from '../utils/label'
import { UseFocusReturnProps } from './useFocus'

export const useMouse = ({
  canvas,
  canvasDims,
  focus,
  loadListeners
}: {
  canvas: fabric.Canvas | null
  canvasDims: Dimension | null
  focus: UseFocusReturnProps
  loadListeners: (newListeners: object) => void
}) => {
  const lastPosition = useRef<Point>(new Point())
  const isPanning = useRef<boolean>(false)

  const { setObjects } = focus
  const nothing = { lastPosition, isPanning, setObjects, loadListeners }
  !nothing

  /**
   * Exchange its fill-color and stroke-color if it is point/endpoint
   * @param obj moving object
   */
  const setHoverEffectOfEndpoint = (obj: fabric.Object) => {
    if (isPoint(obj) || isEndpoint(obj))
      obj.set({
        fill: obj.stroke,
        stroke: obj.fill as string
      })
  }

  // mount gestures event listener
  const pinchListener = usePinch(() => {})()
  if (canvas) {
    const canvasExtendEle = canvas.getElement().parentElement
    canvasExtendEle!.onwheel = pinchListener['onWheel']
  }

  useEffect(() => {
    if (!canvas) return

    const setZoomAndGetNewZoom = (evt: WheelEvent) => {
      const { deltaY, offsetX: x, offsetY: y } = evt
      const delta = deltaY * (evt.cancelable ? 3 : 1) // make touchBoard more smooth
      const zoom = getBetween(canvas.getZoom() * 0.999 ** delta, 0.01, 20)
      canvas.zoomToPoint({ x, y }, zoom)
      return zoom
    }
    const setViewport = (zoom: number, offset: Point = new Point()) => {
      const { w, h } = canvasDims! || new Point()
      const { x, y } = offset
      const vpt = canvas.viewportTransform as number[]
      const offsetX = w * (1 - zoom)
      const offsetY = h * (1 - zoom)
      vpt[4] = zoom < 1 ? offsetX / 2 : getBetween(vpt[4] + x, offsetX, 0)
      vpt[5] = zoom < 1 ? offsetY / 2 : getBetween(vpt[5] + y, offsetY, 0)
      canvas.requestRenderAll()
    }

    const listeners = {
      'mouse:over': (e: fabric.IEvent<MouseEvent>) => {
        const obj = e.target
        if (!obj) return

        setHoverEffectOfEndpoint(obj)
        focus.isFocused(obj as any) &&
          isPolygonLine(obj) &&
          canvas.add((obj as any).midpoint)

        canvas.requestRenderAll()
      },
      'mouse:out': (e: fabric.IEvent<MouseEvent>) => {
        const obj = e.target as fabric.Object
        if (!obj) return

        setHoverEffectOfEndpoint(obj)
        if (isPolygonLine(obj)) {
          const isMoveToMidpoint =
            (e as any).nextTarget === (obj as any).midpoint
          if (!isMoveToMidpoint) canvas.remove((obj as any).midpoint)
        } else if (obj.type === 'midpoint') canvas.remove(obj)

        canvas.requestRenderAll()
      },
      'mouse:wheel': (event: fabric.IEvent<WheelEvent>) => {
        setViewport(setZoomAndGetNewZoom(event.e))
      },
      'mouse:down': (e: fabric.IEvent<MouseEvent>) => {
        // if (isDrawingStarted.current) drawingBreak(e)
        // else if (nowFocus.drawingType) drawingStart(e)
        // else
        if (!canvas.getActiveObject()) {
          const evt = e.e as any
          const { clientX, clientY } = isTouchEvent(evt) ? evt.touches[0] : evt
          lastPosition.current = new Point(clientX, clientY)
          setObjects()
          canvas.setCursor('grabbing')
          isPanning.current = true
        }
      },
      'mouse:move': (e: fabric.IEvent<MouseEvent>) => {
        // if (isDrawingStarted.current) drawOnMouseMove(e)
        // else
        if (isPanning.current) {
          const { e: evt } = e as any
          const { clientX, clientY } = isTouchEvent(evt) ? evt.touches[0] : evt
          const { x: lastX, y: lastY } = lastPosition.current
          const offset = new Point(clientX - lastX, clientY - lastY)
          setViewport(canvas.getZoom(), offset)
          lastPosition.current = new Point(clientX, clientY)
          canvas.setCursor('grabbing')
        }
      },
      'mouse:up': () => {
        // if (
        //   isDrawingStarted.current &&
        //   nowFocus.drawingType === LabelType.Point
        // )
        //   drawingStop()
        // else
        if (isPanning.current) isPanning.current = false
      }
    }
    loadListeners(listeners)
  }, [canvas, canvasDims])
}
