import { fabric } from 'fabric'
import { MutableRefObject, useCallback, useRef } from 'react'
import { Dimension } from '../interface/basic'
import {
  NEW_CATEGORY_NAME,
  STROKE_WIDTH,
  TRANSPARENT
} from '../interface/config'
import { isLine, isPoint, isRect, newFabricObjects } from '../label/Label'
import { Point } from '../label/PointLabel'
import { getBetween } from '../utils/math'
import { isInvalid, isTouchEvent } from '../utils/util'
import { UseColorsReturnProps } from './useColor'
import { UseFocusReturnProps } from './useFocus'
import { UseStateStackReturnProps } from './useStateStack'

export const useMouse = ({
  canvasRef,
  stateStack,
  focus,
  annoColors,
  imageDims,
  canvasDims,
  boundary,
  offset,
  scale
}: {
  canvasRef: MutableRefObject<fabric.Canvas | null>
  stateStack: UseStateStackReturnProps
  focus: UseFocusReturnProps
  annoColors: UseColorsReturnProps
  imageDims: Dimension
  canvasDims: Dimension
  boundary: { x: number[]; y: number[] }
  offset: Point
  scale: number
}) => {
  const onDrawObj = useRef<fabric.Object | null>()
  const lastPosition = useRef<Point>({ x: 0, y: 0 })
  const isPanning = useRef<boolean>(false)
  const isDrawingStarted = useRef<boolean>(false)
  const canvas = canvasRef.current!

  const { nowState } = stateStack
  const { now: nowFocus, setFocus, setDrawing } = focus

  // TODO: remove this
  let nothing: any = { imageDims, offset, scale }
  nothing = !nothing

  const setZoomAndGetNewZoom = useCallback(
    (evt: any) => {
      const { deltaY: delta, offsetX: x, offsetY: y } = evt
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
      canvas.requestRenderAll()
    },
    [canvas, canvasDims]
  )

  const drawOnMouseDown = (event: fabric.IEvent) => {
    const { x: nowX, y: nowY } = canvas.getPointer(event.e)
    const x = getBetween(nowX, ...boundary.x)
    const y = getBetween(nowY, ...boundary.y)
    lastPosition.current = { x, y }

    const categoryName = nowFocus.categoryName || NEW_CATEGORY_NAME
    const id = Math.max(-1, ...nowState.map((anno) => anno.id)) + 1
    const color = annoColors.get(categoryName)

    const fabricObjects = newFabricObjects({
      position: { x, y },
      type: nowFocus.isDrawing!,
      categoryName,
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
    canvas.requestRenderAll()
  }

  const drawStopOnMouseUp = () => {
    const obj = onDrawObj.current as any

    if (isInvalid(obj, nowFocus.isDrawing!)) {
      canvas.remove(...canvas.getObjects().filter((o: any) => o.id === obj.id))
    } else {
      setFocus(obj)
      canvas.setActiveObject(obj.labelType !== 'Line' ? obj : obj.endpoints[1])
    }

    isDrawingStarted.current = false
    onDrawObj.current = null
    setDrawing(null)
    canvas.requestRenderAll()
  }

  const listeners = {
    // Reference: http://fabricjs.com/fabric-intro-part-5
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
    },
    'mouse:down': (e: fabric.IEvent<MouseEvent>) => {
      if (nowFocus.isDrawing) drawOnMouseDown(e)
      else {
        const evt = e.e as any
        const { clientX, clientY } = isTouchEvent(evt) ? evt.touches[0] : evt
        lastPosition.current = { x: clientX, y: clientY }

        const selectedObj = canvas.getActiveObject()
        isPanning.current = !selectedObj
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
