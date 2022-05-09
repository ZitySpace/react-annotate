import { usePinch } from '@use-gesture/react'
import { fabric } from 'fabric'
import { useRef } from 'react'
import { Point } from '../classes/Geometry/Point'
import { LabelType } from '../classes/Label'
import { PolygonLabel } from '../classes/Label/PolygonLabel'
import {
  LINE_DEFAULT_CONFIG,
  NEW_CATEGORY_NAME,
  POINT_DEFAULT_CONFIG,
  RADIUS,
  STROKE_WIDTH,
  TRANSPARENT
} from '../interfaces/config'
import { getBetween, isInvalid, isTouchEvent } from '../utils'
import {
  isEndpoint,
  isLine,
  isPoint,
  isPolygon,
  isPolygonLine,
  isRect,
  newLabel,
  updateEndpointAssociatedLinesPosition
} from '../utils/label'
import { UseColorsReturnProps } from './useColor'
import { GeometricAttributes } from './useData'
import { UseFocusReturnProps } from './useFocus'
import { UseStateStackReturnProps } from './useStateStack'

export const useMouse = ({
  canvas,
  geometricAttributes,
  stateStack,
  focus,
  annoColors,
  loadListeners
}: {
  canvas: fabric.Canvas | null
  geometricAttributes: GeometricAttributes
  stateStack: UseStateStackReturnProps
  focus: UseFocusReturnProps
  annoColors: UseColorsReturnProps
  loadListeners: (newListeners: object) => void
}) => {
  const lastPosition = useRef<Point>(new Point())
  const isPanning = useRef<boolean>(false)
  const isDrawingStarted = useRef<boolean>(false)
  const onDrawObj = useRef<fabric.Object | null>(null)

  // mount gestures event listener
  const pinchListener = usePinch(() => {})()
  if (canvas) {
    const canvasExtendEle = canvas.getElement().parentElement
    canvasExtendEle!.onwheel = pinchListener['onWheel']
  }

  if (!canvas) return
  const { nowFocus, setDrawingType, setObjects } = focus
  const { canvasDims, imageBoundary, scale, offset } = geometricAttributes
  const { nowState } = stateStack

  /**
   * If it is a point / endpoint, swap its fill color and stroke color
   * @param obj moving object
   */
  const setHoverEffectOfEndpoint = (obj: fabric.Object) => {
    if (isPoint(obj) || isEndpoint(obj))
      obj.set({
        fill: obj.stroke,
        stroke: obj.fill as string
      })
  }

  /**
   * Calculate and set canvas's zoom scale based on mouse wheel event
   * @param evt wheel event
   * @returns
   */
  const setZoomAndGetNewZoom = (evt: WheelEvent) => {
    const { deltaY, offsetX: x, offsetY: y } = evt
    const delta = deltaY * (evt.cancelable ? 3 : 1) // make touchBoard more smooth
    const zoom = getBetween(canvas.getZoom() * 0.999 ** delta, 0.01, 20)
    canvas.zoomToPoint({ x, y }, zoom)
    return zoom
  }

  /**
   *
   * @param zoom zoom scale
   * @param offset cursor offset after panning
   */
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

  const drawingStart = (event: fabric.IEvent) => {
    const { x, y } = imageBoundary.within(canvas.getPointer(event.e))
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
    onDrawObj.current = fabricObjects[0]
    isDrawingStarted.current = true
  }

  const drawOnMouseMove = (event: fabric.IEvent) => {
    const { x: nowX, y: nowY } = imageBoundary.within(
      canvas.getPointer(event.e)
    )
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
    } else if (isLine(obj) || isPolygon(obj)) {
      const left = nowX
      const top = nowY
      const { points, endpoints } = obj
      const lastEndpoint = endpoints[endpoints.length - 1]
      lastEndpoint.set({ left, top })
      updateEndpointAssociatedLinesPosition(lastEndpoint)
      if (points) points[points.length - 1] = new Point(left, top)
    }

    canvas.requestRenderAll()
  }

  const drawingBreak = (event: fabric.IEvent) => {
    console.log('drawingBreak')
    const obj = onDrawObj.current as any

    // for segmentation, drawing is not done in once
    if (isPolygon(obj)) {
      const { points, endpoints, lines, labelType, category, id } = obj
      const color = annoColors.get(category)
      const { left, top } = imageBoundary.within(canvas.getPointer(event.e))
      const nowPoint = new Point(left, top)

      if (nowPoint.distanceFrom(points[0]) < RADIUS) {
        // if the last click is close to the starting point, stop drawing
        // remove the last point because it is used to show the cursor and has no practical meaning
        points.pop()
        const newFabricObjs = new PolygonLabel({
          obj,
          scale,
          offset
        }).getFabricObjects(color, true, false)
        canvas.remove(obj, ...endpoints, ...lines).add(...newFabricObjs)
        drawingStop()
      } else {
        points.push(nowPoint)
        const newEndpoint = new fabric.Circle({
          ...POINT_DEFAULT_CONFIG,
          left,
          top,
          fill: color,
          stroke: TRANSPARENT,
          selectable: false
        })
        newEndpoint.setOptions({ _id: endpoints.length, lines: [] })
        endpoints.push(newEndpoint)

        const endpointsOfNewLine = endpoints.slice(
          endpoints.length - 2,
          endpoints.length
        )
        const newLine = new fabric.Line([left, top, left, top], {
          ...LINE_DEFAULT_CONFIG,
          stroke: color
        })
        newLine.setOptions({ endpoints: endpointsOfNewLine })
        lines.push(newLine)
        endpointsOfNewLine.forEach((endpoint: fabric.Circle) => {
          ;(endpoint as any).lines.push(newLine)
        })
        const products = [newLine, newEndpoint]
        products.forEach((obj) => obj.setOptions({ labelType, category, id }))
        canvas.add(...products)
      }
    } else drawingStop()
  }

  const drawingStop = () => {
    console.log('drawingStop')
    const obj = onDrawObj.current as any

    if (isInvalid(obj)) {
      canvas.remove(...canvas.getObjects().filter((o: any) => o.id === obj.id))
    } else {
      setObjects([newLabel({ obj, offset, scale })])
      canvas.setActiveObject(
        [LabelType.Line].includes(obj.labelType)
          ? obj.endpoints[obj.endpoints.length - 1]
          : obj
      )
    }

    isDrawingStarted.current = false
    onDrawObj.current = null
    setDrawingType()
    canvas.renderAll()
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
        const isMoveToMidpoint = (e as any).nextTarget === (obj as any).midpoint
        if (!isMoveToMidpoint) canvas.remove((obj as any).midpoint)
      } else if (obj.type === 'midpoint') canvas.remove(obj)

      canvas.requestRenderAll()
    },
    'mouse:wheel': (event: fabric.IEvent<WheelEvent>) => {
      setViewport(setZoomAndGetNewZoom(event.e))
    },
    'mouse:down': (e: fabric.IEvent<MouseEvent>) => {
      if (isDrawingStarted.current) drawingBreak(e)
      else if (nowFocus.drawingType) drawingStart(e)
      else if (!canvas.getActiveObject()) {
        const evt = e.e as any
        const { clientX, clientY } = isTouchEvent(evt) ? evt.touches[0] : evt
        lastPosition.current = new Point(clientX, clientY)
        setObjects()
        canvas.setCursor('grabbing')
        isPanning.current = true
      }
    },
    'mouse:move': (e: fabric.IEvent<MouseEvent>) => {
      if (isDrawingStarted.current) drawOnMouseMove(e)
      else if (isPanning.current) {
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
      if (isDrawingStarted.current && nowFocus.drawingType === LabelType.Point)
        drawingStop()
      else if (isPanning.current) isPanning.current = false
    }
  }

  loadListeners(listeners)
}
