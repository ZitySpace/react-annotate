import { fabric } from 'fabric'
import React, { useEffect, useRef } from 'react'
import { Dimension } from '../classes/Geometry/Dimension'
import { CANVAS_CONFIG } from '../interfaces/config'
import { useUpdate } from 'react-use'

export interface UseContainerReturnProps {
  Container: JSX.Element // canvas dom
  canvas: fabric.Canvas | null
  canvasDims: Dimension | null
}

export const useContainer = () => {
  const canvasRef = useRef<fabric.Canvas | null>(null)
  const canvasElm = useRef<HTMLCanvasElement | null>(null)
  const canvasDimsRef = useRef<Dimension | null>(null)

  const initWidthRef = useRef<number>(0)
  const update = useUpdate()

  const updateCanvas = (isInitialize: boolean = false) => {
    canvasRef.current =
      canvasRef.current || new fabric.Canvas(canvasElm.current, CANVAS_CONFIG)

    const canvas = canvasRef.current

    const { w: canvas_w, h: canvas_h } = calcCanvasDims()
    canvas.setWidth(canvas_w)
    canvas.setHeight(canvas_h)

    if (isInitialize) {
      // set canvas element and its extend element styles
      const lowerCanvasElm = canvas.getElement()
      const upperCanvasElm = lowerCanvasElm.nextElementSibling as Element
      const extendElm = lowerCanvasElm.parentElement as HTMLElement
      extendElm.style.position = 'absolute'
      extendElm.style.top = '0'
      extendElm.style.touchAction = 'none'
      extendElm.classList.add('bg-gray-200')
      lowerCanvasElm.classList.remove('hidden')
      upperCanvasElm.classList.remove('hidden')

      initWidthRef.current = canvas_w
    }
  }

  const calcCanvasDims = () => {
    const extendElm = document.getElementById('canvas_extended') as HTMLElement
    const { width: canvas_w, height: _canvas_h } =
      extendElm.getBoundingClientRect() // get canvas extend element dimensions
    const canvas_h = _canvas_h - 36 // minus the buttons bar's height
    const _canvasDims = new Dimension(canvas_w, canvas_h)
    canvasDimsRef.current = _canvasDims
    return _canvasDims
  }

  useEffect(() => {
    updateCanvas(true)
  }, [canvasElm])

  useEffect(() => {
    const canvas = canvasRef.current
    const canvasDims = canvasDimsRef.current

    if (!canvasDims || !canvas) return

    const vpt = canvas.viewportTransform as number[]
    const { w: canvas_w } = canvasDims
    const zoom = canvas.getZoom()
    if (canvas_w >= initWidthRef.current * zoom) {
      vpt[4] = (canvas_w - initWidthRef.current * zoom) / 2
    }

    canvas.setViewportTransform(vpt)
  }, [canvasDimsRef.current])

  window.onresize = () => {
    updateCanvas()
    update()
  }

  return {
    Container: (
      <div
        className='h-full relative pb-7 md:pb-9 select-none w-full flex justify-center items-center overflow-y-hidden'
        id='canvas_extended'
      >
        <canvas ref={canvasElm} className='hidden' />
        {/* <LoadingIcon /> */}
      </div>
    ),
    canvas: canvasRef.current,
    canvasDims: canvasDimsRef.current,
    initWidthRef
  }
}
