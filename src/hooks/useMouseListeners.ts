import { usePinch } from '@use-gesture/react'
import { fabric } from 'fabric'
import { MutableRefObject, useCallback, useRef } from 'react'
import { Point } from '../classes/Geometry/Point'
import { LabelType } from '../classes/Label'
import { NEW_CATEGORY_NAME, RADIUS, STROKE_WIDTH } from '../interfaces/config'
import { getBetween, isInvalid, isTouchEvent } from '../utils'
import { isLine, isPoint, isPolygon, isRect, newLabel } from '../utils/label'
import { UseColorsReturnProps } from './useColor'
import { CanvasProps } from './useContainer'
import { UseFocusReturnProps } from './useFocus'
import { UseStateStackReturnProps } from './useStateStack'

export const useMouseListeners = ({
  canvasRef,
  canvasProps,
  stateStack,
  focus,
  annoColors
}: {
  canvasRef: MutableRefObject<fabric.Canvas | null>
  canvasProps: CanvasProps
  stateStack: UseStateStackReturnProps
  focus: UseFocusReturnProps
  annoColors: UseColorsReturnProps
}) => {
  const onDrawObj = useRef<fabric.Object | null>()
  const lastPosition = useRef<Point>(new Point())
  const isPanning = useRef<boolean>(false)
  const isDrawingStarted = useRef<boolean>(false)
  const canvas = canvasRef.current!

  const { nowState } = stateStack
  const { nowFocus, setDrawingType, setObjects } = focus
  const { canvasDims, boundary, offset, scale } = canvasProps

  const setZoomAndGetNewZoom = useCallback(
    (evt: any) => {
      const { deltaY, offsetX: x, offsetY: y } = evt
      const delta = deltaY * (evt.cancelable ? 3 : 1) // make touchBoard more smooth
      const zoom = getBetween(canvas.getZoom() * 0.999 ** delta, 0.01, 20)
      canvas.zoomToPoint({ x, y }, zoom)
      return zoom
    },
    [canvas]
  )

  const setViewport = useCallback(
    ({ zoom, offset = new Point() }: { zoom: number; offset?: Point }) => {
      const { w, h } = canvasDims
      const { x, y } = offset
      const vpt = canvas.viewportTransform as number[]
      const offsetX = w * (1 - zoom)
      const offsetY = h * (1 - zoom)
      vpt[4] = zoom < 1 ? offsetX / 2 : getBetween(vpt[4] + x, offsetX, 0)
      vpt[5] = zoom < 1 ? offsetY / 2 : getBetween(vpt[5] + y, offsetY, 0)
      canvas.renderAll()
    },
    [canvas, canvasDims]
  )

  const exchangeColorIfIsEndpoint = (event: fabric.IEvent) => {
    const obj = event.target as any
    if (obj?.type === 'circle')
      obj.set({
        fill: obj.stroke,
        stroke: obj.fill
      })
    canvas.renderAll()
  }

  const drawingStart = (event: fabric.IEvent) => {
    const { x: nowX, y: nowY } = canvas.getPointer(event.e)
    const x = getBetween(nowX, ...boundary.x)
    const y = getBetween(nowY, ...boundary.y)
    lastPosition.current = new Point(x, y)

    const category = nowFocus.category || NEW_CATEGORY_NAME
    const id = Math.max(-1, ...nowState.map(({ id }) => id)) + 1
    const color = annoColors.get(category)

    const fabricObjects = newLabel({
      labelType: nowFocus.drawingType,
      position: new Point(x, y),
      category,
      id,
      scale,
      offset
    }).getFabricObjects(color, true, false)

    canvas.add(...fabricObjects)
    console.log(canvas.getObjects())
    onDrawObj.current = fabricObjects[0]
    isDrawingStarted.current = true
  }

  const drawOnMouseMove = (event: fabric.IEvent) => {
    const { x, y } = canvas.getPointer(event.e)
    const nowX = getBetween(x, ...boundary.x)
    const nowY = getBetween(y, ...boundary.y)
    const { x: lastX, y: lastY } = lastPosition.current
    const obj = onDrawObj.current as any
    if (!obj) return

    if (isRect(obj)) {
      const left = Math.min(lastX, nowX)
      const top = Math.min(lastY, nowY)
      const right = Math.max(lastX, nowX) - STROKE_WIDTH // width and height will add stroke width automatically so we need to subtract it
      const bottom = Math.max(lastY, nowY) - STROKE_WIDTH
      obj.set({ left, top, width: right - left, height: bottom - top })
    } else if (isPoint(obj)) {
      const left = nowX
      const top = nowY
      obj.set({ left, top })
    } else if (isLine(obj)) {
      const left = nowX
      const top = nowY
      obj.endpoints[1].set({ left, top })
      obj.set({ x2: left, y2: top })
    }
    canvas.renderAll()
  }

  const drawingBreak = (event: fabric.IEvent) => {
    const obj = onDrawObj.current as any
    if (isPolygon(obj)) {
      const { x, y } = canvas.getPointer(event.e)
      const nowPoint = new Point(x, y)
      const { points } = obj

      if (nowPoint.distanceFrom(points[0]) < RADIUS * 2) drawingStop()
      else {
        obj.set({ points: [...points, nowPoint] })
        canvas.renderAll()
      }
    } else drawingStop()
  }

  const drawingStop = () => {
    const obj = onDrawObj.current as any
    console.log(obj)

    if (isInvalid(obj, nowFocus.drawingType)) {
      canvas.remove(...canvas.getObjects().filter((o: any) => o.id === obj.id))
    } else {
      setObjects([newLabel({ obj, offset, scale })])
      canvas.setActiveObject(
        obj.labelType !== LabelType.Line ? obj : obj.endpoints[1]
      )
    }

    isDrawingStarted.current = false
    onDrawObj.current = null
    setDrawingType()
    canvas.renderAll()
  }

  // mount gestures event listener
  const pinchListener = usePinch(() => {})()
  if (canvas) {
    const canvasExtendEle = canvas.getElement().parentElement
    canvasExtendEle!.onwheel = pinchListener['onWheel']
  }

  const listeners = {
    // Reference: http://fabricjs.com/fabric-intro-part-5
    'mouse:wheel': (e: fabric.IEvent<WheelEvent>) => {
      const zoom = setZoomAndGetNewZoom(e.e)
      setViewport({ zoom })
    },
    'mouse:over': exchangeColorIfIsEndpoint,
    'mouse:out': exchangeColorIfIsEndpoint,
    'mouse:down': (e: fabric.IEvent<MouseEvent>) => {
      // if (isDrawingStarted.current) drawingStop()f
      if (isDrawingStarted.current) drawingBreak(e)
      else if (nowFocus.drawingType) drawingStart(e)
      else {
        const evt = e.e as any
        const { clientX, clientY } = isTouchEvent(evt) ? evt.touches[0] : evt
        lastPosition.current = new Point(clientX, clientY)

        const selectedObj = canvas.getActiveObject()
        isPanning.current = !selectedObj
        isPanning.current && setObjects()
        isPanning.current && canvas.setCursor('grabbing')
      }
    },
    'mouse:move': (e: fabric.IEvent<MouseEvent>) => {
      if (isDrawingStarted.current) drawOnMouseMove(e)
      else if (isPanning.current) {
        const { e: evt } = e as any
        const { clientX, clientY } = isTouchEvent(evt) ? evt.touches[0] : evt
        const { x: lastX, y: lastY } = lastPosition.current
        const offset = new Point(clientX - lastX, clientY - lastY)
        lastPosition.current = new Point(clientX, clientY)

        const zoom = canvas.getZoom()
        setViewport({ zoom, offset })

        canvas.setCursor('grabbing')
      }
    },
    'mouse:up': () => {
      if (isDrawingStarted.current && nowFocus.drawingType === LabelType.Point)
        drawingStop()
      else if (isPanning.current) {
        canvas.setViewportTransform(canvas.viewportTransform as number[])
        isPanning.current = false
      }
    }
  }

  return { ...listeners }
}
