import { fabric } from 'fabric'
import {
  NEW_CATEGORY_NAME,
  STROKE_WIDTH,
  TRANSPARENT
} from '../interfaces/config'
import {
  isLine,
  isPoint,
  isRect,
  newFabricObjects,
  newLabelFromFabricObj
} from '../classes/Label'
import { Point } from '../classes/Label/PointLabel'
import { getBetween } from '../utils/math'
import { isInvalid, isTouchEvent } from '../utils/util'
import { UseColorsReturnProps } from './useColor'
import { UseFocusReturnProps } from './useFocus'
import { UseStateStackReturnProps } from './useStateStack'
import { usePinch } from '@use-gesture/react'
import { CanvasProps } from './useContainer'
import { MutableRefObject, useCallback, useRef } from 'react'

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
  const lastPosition = useRef<Point>({ x: 0, y: 0 })
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
    ({ zoom, offset = { x: 0, y: 0 } }: { zoom: number; offset?: Point }) => {
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

  const drawOnMouseDown = (event: fabric.IEvent) => {
    const { x: nowX, y: nowY } = canvas.getPointer(event.e)
    const x = getBetween(nowX, ...boundary.x)
    const y = getBetween(nowY, ...boundary.y)
    lastPosition.current = { x, y }

    const category = nowFocus.category || NEW_CATEGORY_NAME
    const id = Math.max(-1, ...nowState.map((anno) => anno.id)) + 1
    const color = annoColors.get(category)

    const fabricObjects = newFabricObjects({
      position: { x, y },
      type: nowFocus.drawingType!,
      categoryName: category,
      id,
      color
    })

    canvas.add(...fabricObjects)
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
      const left = Math.min(lastX, nowX) - STROKE_WIDTH
      const right = Math.max(lastX, nowX)
      const top = Math.min(lastY, nowY) - STROKE_WIDTH
      const bottom = Math.max(lastY, nowY)
      obj.set({ left, top, width: right - left, height: bottom - top })
    } else if (isPoint(obj)) {
      const left = nowX
      const top = nowY
      obj.set({ left, top })
    } else if (isLine(obj)) {
      const left = nowX
      const top = nowY
      obj.endpoints[1].set({ left, top })
      obj.set({ x2: left - STROKE_WIDTH / 2, y2: top - STROKE_WIDTH / 2 })
    }
    canvas.renderAll()
  }

  const drawStopOnMouseUp = () => {
    const obj = onDrawObj.current as any

    if (isInvalid(obj, nowFocus.drawingType!)) {
      canvas.remove(...canvas.getObjects().filter((o: any) => o.id === obj.id))
    } else {
      setObjects([newLabelFromFabricObj({ obj, offset, scale })])
      canvas.setActiveObject(obj.labelType !== 'Line' ? obj : obj.endpoints[1])
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
    'mouse:over': (e: fabric.IEvent) => {
      const obj = e.target as any
      if (obj?.type === 'circle')
        obj.set({
          fill: TRANSPARENT,
          stroke: obj.color
        })
      canvas.renderAll()
    },
    'mouse:out': (e: fabric.IEvent) => {
      const obj = e.target as any
      if (obj?.type === 'circle')
        obj.set({
          fill: obj.color,
          stroke: TRANSPARENT
        })
      canvas.renderAll()
    },
    'mouse:down': (e: fabric.IEvent<MouseEvent>) => {
      ;(document.activeElement as HTMLElement).blur() // canvas would block blur event, need set it manually
      if (nowFocus.drawingType) drawOnMouseDown(e)
      else {
        const evt = e.e as any
        const { clientX, clientY } = isTouchEvent(evt) ? evt.touches[0] : evt
        lastPosition.current = { x: clientX, y: clientY }

        const selectedObj = canvas.getActiveObject()
        isPanning.current = !selectedObj
        isPanning.current && setObjects()
      }
    },
    'mouse:move': (e: fabric.IEvent<MouseEvent>) => {
      if (isDrawingStarted.current) drawOnMouseMove(e)
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
      if (isDrawingStarted.current) drawStopOnMouseUp()
      else if (isPanning.current) {
        canvas.setViewportTransform(canvas.viewportTransform as number[])
        isPanning.current = false
      }
    }
  }

  return { ...listeners }
}
