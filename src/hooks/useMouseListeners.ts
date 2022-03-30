import { usePinch } from '@use-gesture/react'
import { fabric } from 'fabric'
import { MutableRefObject, useCallback, useRef } from 'react'
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

  const { nowState, replaceObject } = stateStack
  const { nowFocus, setDrawingType, setObjects, isFocused } = focus
  const { canvasDims, imgBoundary, offset, scale } = canvasProps

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

  const setHoverEffectOfEndpoint = (event: fabric.IEvent) => {
    const obj = event.target as any
    if (obj && (isPoint(obj) || isEndpoint(obj))) {
      obj.set({
        fill: obj.stroke,
        stroke: obj.fill
      })
    }
    canvas.requestRenderAll()
  }

  const setHoverEffectOfPolygonLine = (event: fabric.IEvent) => {
    const obj = event.target as any
    const isOver = event.hasOwnProperty('previousTarget')

    if (obj && isPolygonLine(obj) && isFocused(obj)) {
      const { midpoint } = obj
      if (isOver) {
        const oldMidpoints = canvas.getObjects('midpoint')
        canvas.remove(...oldMidpoints).add(midpoint)
      } else {
        const isMoveToMidpoint = (event as any).nextTarget === midpoint
        if (!isMoveToMidpoint) canvas.remove(midpoint)
      }
    }
  }

  const drawingStart = (event: fabric.IEvent) => {
    const { x, y } = imgBoundary.within(canvas.getPointer(event.e))
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
    const { x: nowX, y: nowY } = imgBoundary.within(canvas.getPointer(event.e))
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

    canvas.renderAll()
  }

  const drawingBreak = (event: fabric.IEvent) => {
    console.log('drawingBreak')
    const obj = onDrawObj.current as any

    if (isPolygon(obj)) {
      const { points, endpoints, lines, labelType, category, id } = obj
      const color = annoColors.get(category)
      const { left, top } = imgBoundary.within(canvas.getPointer(event.e))
      const nowPoint = new Point(left, top)

      if (nowPoint.distanceFrom(points[0]) < RADIUS) {
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
    'mouse:over': (e: fabric.IEvent<MouseEvent>) => {
      setHoverEffectOfEndpoint(e)
      setHoverEffectOfPolygonLine(e)
    },
    'mouse:out': (e: fabric.IEvent<MouseEvent>) => {
      setHoverEffectOfEndpoint(e)
      setHoverEffectOfPolygonLine(e)
    },
    'mouse:down': (e: fabric.IEvent<MouseEvent>) => {
      isPanning.current = !e.target

      if (isDrawingStarted.current) drawingBreak(e)
      else if (nowFocus.drawingType) drawingStart(e)
      else if (isPanning.current) {
        const evt = e.e as any
        const { clientX, clientY } = isTouchEvent(evt) ? evt.touches[0] : evt
        lastPosition.current = new Point(clientX, clientY)
        setObjects()
        canvas.setCursor('grabbing')
      } else if (e.target?.type === 'midpoint') {
        const { polygon, _id, left, top } = e.target as any
        polygon.points.splice(_id + 1, 0, new Point(left, top))
        const newPolygonLabel = new PolygonLabel({
          obj: polygon,
          scale,
          offset
        })
        replaceObject(polygon.id, newPolygonLabel)
        setObjects([newPolygonLabel])
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
