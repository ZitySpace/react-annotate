import { fabric } from 'fabric'
import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { Dimension } from '../interface/basic'
import { Point } from '../label/PointLabel'

/**
 * Load image and re-initialize canvas, then calculate the dimensions ans so on.
 * @param imageObj: an image object with basic info
 * @param canvasRef reference to canvas
 * @returns node of image&canvas container, and some calculated variables
 */
export const useContainer = ({
  imageObj,
  canvasRef
}: {
  imageObj: any
  canvasRef: MutableRefObject<fabric.Canvas | null>
}) => {
  const [imageDims, setImageDims] = useState<Dimension | null>(null)
  const [canvasDims, setCanvasDims] = useState<Dimension | null>(null)
  const [boundary, setBoundary] = useState<{ x: number[]; y: number[] } | null>(
    null
  )
  const [offset, setOffset] = useState<Point | null>(null)
  const [scale, setScale] = useState<number>(1)

  const imgElRef = useRef<HTMLImageElement>(null)
  const canvasElRef = useRef<HTMLCanvasElement>(null)

  const onLoad = useCallback(() => {
    const imgElm = imgElRef.current
      ? (imgElRef.current as unknown as HTMLImageElement)
      : imgElRef.current
    const canvasElm = canvasElRef.current
      ? (canvasElRef.current as unknown as HTMLCanvasElement)
      : canvasElRef.current

    if (imgElm && canvasElm) {
      let extendElm = document.getElementById('canvas_extended') as HTMLElement

      const { width: iw, height: ih } = imgElm.getBoundingClientRect()
      const { width: cew, height: ceh } = extendElm.getBoundingClientRect()

      // necessary for using in below step because setState in async
      const _offset = {
        x: (cew - iw) / 2,
        y: (ceh - ih) / 2
      }
      const _scale = (iw / imgElm.naturalWidth + ih / imgElm.naturalHeight) / 2

      setImageDims({ w: iw, h: ih })
      setCanvasDims({ w: cew, h: cew }) // canvas dimensions will be set as same as extend element
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

      // add image
      canvas.clear()
      canvas.add(
        new fabric.Image(imgElm, {
          left: _offset.x,
          top: _offset.y,
          scaleX: _scale,
          scaleY: _scale,
          hasBorders: false,
          hasControls: false,
          selectable: false,
          hoverCursor: 'default'
        })
      )

      const lowerCanvasElm = canvas.getElement()
      const upperCanvasElm = lowerCanvasElm.nextElementSibling as Element
      extendElm = lowerCanvasElm.parentElement as HTMLElement

      extendElm.style.position = 'absolute'
      extendElm.style.top = '0'
      extendElm.style.touchAction = 'none'
      extendElm.classList.add('bg-gray-200')

      lowerCanvasElm.classList.remove('hidden')
      upperCanvasElm.classList.remove('hidden')

      canvas.renderAll()
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
      canvasRef.current = canvas
    }
  }, [imgElRef.current, canvasElRef.current])

  useEffect(() => {
    window.onresize = onLoad
  })

  return {
    imageContainer: (
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
    imageDims,
    canvasDims,
    boundary,
    offset,
    scale
  }
}
