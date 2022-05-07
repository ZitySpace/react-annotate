import { fabric } from 'fabric'
import React, { useEffect, useRef } from 'react'
import { Dimension } from '../classes/Geometry/Dimension'
import { CANVAS_CONFIG } from '../interfaces/config'

export interface UseContainerReturnProps {
  Container: JSX.Element // canvas dom
  canvas: fabric.Canvas | null
  canvasDims: Dimension | null
}

export const useContainer = () => {
  const canvasRef = useRef<fabric.Canvas | null>(null)
  const canvasElm = useRef<HTMLCanvasElement | null>(null)
  const canvasDims = useRef<Dimension | null>(null)

  const updateCanvas = (isInitialize: boolean = false) => {
    console.log('updateCanvas', isInitialize)

    const canvas =
      canvasRef.current || new fabric.Canvas(canvasElm.current, CANVAS_CONFIG)

    const { w: canvas_w, h: canvas_h } = calcCanvasDims()
    canvas.setWidth(canvas_w)
    canvas.setHeight(canvas_h)

    if (!canvasRef.current) canvasRef.current = canvas

    if (isInitialize) {
      console.log(canvasRef)
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
    }
  }

  const calcCanvasDims = () => {
    const extendElm = document.getElementById('canvas_extended') as HTMLElement
    const { width: canvas_w, height: _canvas_h } =
      extendElm.getBoundingClientRect() // get canvas extend element dimensions
    const canvas_h = _canvas_h - 36 // minus the buttons bar's height
    const _canvasDims = new Dimension(canvas_w, canvas_h)
    canvasDims.current = _canvasDims
    return _canvasDims
  }

  useEffect(() => {
    updateCanvas(true)
  }, [canvasElm])

  window.onresize = () => {
    updateCanvas()
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
    canvasDims: canvasDims.current
  }
}
