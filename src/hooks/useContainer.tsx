import { fabric } from 'fabric'
import React, { useCallback, useRef, useState } from 'react'
import { Dimension } from '../classes/Geometry/Dimension'
import { Point } from '../classes/Geometry/Point'

export interface CanvasProps {
  imageDims: Dimension // image dimensions in container
  canvasDims: Dimension // canvas dimensions
  boundary: { x: number[]; y: number[] } // boundary of image in canvas
  offset: Point // offset of image in canvas
  scale: number // scale of image for its original size in canvas
}

export interface UseContainerReturnProps {
  ImageContainer: JSX.Element // canvas dom
  canvasRef: React.RefObject<fabric.Canvas> // fabric.Canvas instance reference
  canvasProps: CanvasProps // canvas properties
}

/**
 * Load image and re-initialize canvas, then calculate the dimensions ans so on.
 * @param imageObj: an image object with basic info
 * @returns node of image&canvas container, and some calculated variables
 */
export const useContainer = ({
  imageObj
}: {
  imageObj: any
}): UseContainerReturnProps => {
  const [imageDims, setImageDims] = useState<Dimension>(new Dimension())
  const [canvasDims, setCanvasDims] = useState<Dimension>(new Dimension())
  const [boundary, setBoundary] = useState<{ x: number[]; y: number[] }>({
    x: [0, 0],
    y: [0, 0]
  })
  const [offset, setOffset] = useState<Point>(new Point())
  const [scale, setScale] = useState<number>(1)

  const imgElRef = useRef<HTMLImageElement>(null)
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = useRef<fabric.Canvas | null>(null)

  /**
   * Callback of the image src changed trigger image loading event
   * Get image element and canvas element, initialize canvas object and calculate the dimensions and so on,
   *  then set them to the reference and state
   */
  const onLoad = useCallback(() => {
    // ensure that the image element and canvas element exist
    const imgElm = imgElRef.current
      ? (imgElRef.current as unknown as HTMLImageElement)
      : imgElRef.current
    const canvasElm = canvasElRef.current
      ? (canvasElRef.current as unknown as HTMLCanvasElement)
      : canvasElRef.current

    if (imgElm && canvasElm) {
      let extendElm = document.getElementById('canvas_extended') as HTMLElement

      const { width: iw, height: ih } = imgElm.getBoundingClientRect() // get image dimensions in image dom contain
      const { width: cew, height: _ceh } = extendElm.getBoundingClientRect() // get canvas extend element dimensions
      const ceh = _ceh - 36 // minus the buttons bar's height

      // necessary for using in below step because setState in async
      const _offset = new Point((cew - iw) / 2, (ceh - ih) / 2) // offset of scaled image to the canvas
      const _scale = (iw / imgElm.naturalWidth + ih / imgElm.naturalHeight) / 2

      setImageDims(new Dimension(iw, ih))
      setCanvasDims(new Dimension(cew, ceh)) // canvas dimensions will be set as same as extend element
      setBoundary({
        x: [(cew - iw) / 2, (cew + iw) / 2],
        y: [(ceh - ih) / 2, (ceh + ih) / 2]
      })
      setOffset(_offset)
      setScale(_scale)

      // initialize canvas
      const canvas =
        canvasRef.current ||
        new fabric.Canvas(canvasElm, {
          defaultCursor: 'default',
          selection: false,
          targetFindTolerance: 5,
          uniformScaling: false
        })

      canvas.setWidth(cew)
      canvas.setHeight(ceh)

      // update background image
      const { x: left, y: top } = _offset
      const scaleX = _scale
      const scaleY = _scale
      const img = new fabric.Image(imgElm, { left, top, scaleX, scaleY })
      canvas.setBackgroundImage(img, () => {}) // use background image can make canvas's objects plain

      // set canvas element and its extend element styles
      const lowerCanvasElm = canvas.getElement()
      const upperCanvasElm = lowerCanvasElm.nextElementSibling as Element
      extendElm = lowerCanvasElm.parentElement as HTMLElement

      extendElm.style.position = 'absolute'
      extendElm.style.top = '0'
      extendElm.style.touchAction = 'none'
      extendElm.classList.add('bg-gray-200')

      lowerCanvasElm.classList.remove('hidden')
      upperCanvasElm.classList.remove('hidden')

      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]) // set viewport to the center
      canvasRef.current = canvas
    }
  }, [imgElRef.current, canvasElRef.current])

  window.onresize = onLoad // listen window resize event

  return {
    ImageContainer: (
      <div
        className='h-full relative pb-7 md:pb-9 select-none w-full flex justify-center items-center overflow-y-hidden'
        id='canvas_extended'
      >
        <img
          alt={imageObj.fileName}
          title={imageObj.fileName}
          src={imageObj.blobUrl}
          loading='lazy'
          onLoad={onLoad}
          className='object-contain max-h-full invisible'
          ref={imgElRef}
        />
        <canvas ref={canvasElRef} className='hidden' />
      </div>
    ),
    canvasRef,
    canvasProps: { imageDims, canvasDims, boundary, offset, scale }
  }
}
