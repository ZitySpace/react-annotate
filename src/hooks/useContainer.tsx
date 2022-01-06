import { fabric } from 'fabric'
import React, { useCallback, useRef, useState } from 'react'
import { Dimension } from '../interface/basic'
import { Point } from '../label/PointLabel'

export const UseContainer = ({
  imageObj,
  canvasRef
}: {
  imageObj: any
  canvasRef: React.MutableRefObject<fabric.Canvas | null>
}) => {
  const [imageDims, setImageDims] = useState<Dimension | null>(null)
  const [canvasDims, setCanvasDims] = useState<Dimension | null>(null)
  const [boundary, setBoundary] = useState<{ x: number[]; y: number[] } | null>(
    null
  )
  const [offset, setOffset] = useState<Point | null>(null)

  const imgElRef = useRef(null)
  const canvasElRef = useRef(null)

  const onLoad = useCallback(() => {
    const imgElm = imgElRef.current
      ? (imgElRef.current as unknown as HTMLImageElement)
      : imgElRef.current
    const canvasElm = canvasElRef.current
      ? (canvasElRef.current as unknown as HTMLCanvasElement)
      : canvasElRef.current

    if (imgElm) {
      console.log(imgElm)

      const { width: iw, height: ih } = imgElm.getBoundingClientRect()
      setImageDims({ w: iw, h: ih })
    }

    if (canvasElm) {
      console.log(canvasElm)

      // const canvas = new fabric.Canvas(canvasElm, {
      //   defaultCursor: 'default',
      //   selection: false,
      //   targetFindTolerance: 5,
      //   uniformScaling: false
      // })
      console.log(canvasRef)

      const extendElm = canvasElm.parentElement as HTMLElement
      // extendElm.style.position = 'absolute'
      // extendElm.style.top = '0'
      // extendElm.classList.add('bg-gray-200')
      // extendElm.style.touchAction = 'none'

      // canvasElm.classList.remove('hidden')
      // const upperCanvasEl = canvasElm.nextElementSibling as Element
      // upperCanvasEl.classList.remove('hidden')

      const { width: cw, height: ch } = canvasElm.getBoundingClientRect()
      const { width: cew, height: ceh } = extendElm.getBoundingClientRect()

      setCanvasDims({ w: cw, h: ch })
      setBoundary({
        x: [(cew - cw) / 2, (cew + cw) / 2],
        y: [(ceh - ch) / 2, (ceh + ch) / 2]
      })
      setOffset({
        x: (cew - cw) / 2,
        y: (ceh - ch) / 2
      })

      // canvas.clear()
      // canvas.setWidth(cew)
      // canvas.setHeight(ceh)
      // canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
      // canvasRef.current = canvas
      // console.log(canvas)
    }

    if (imgElm && canvasElm) {
    }
  }, [imgElRef.current, canvasElRef.current])

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
    offset
  }
}
