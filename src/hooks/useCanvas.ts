import { fabric } from 'fabric'
import { MutableRefObject } from 'react'
// import { Dimension } from '../interface/basic'
// import { Transparent } from '../interface/config'
// import { Point } from '../label/PointLabel'
// import { getBetween } from '../utils/math'
import { setLinePosition } from '../utils/util'

export const useCanvas = ({
  canvasRef
}: // canvasDimsRef
// drawingStartedRef,
// onDrawObjRef,
// boundaryRef
{
  canvasRef: MutableRefObject<fabric.Canvas | null>
  // canvasDimsRef: MutableRefObject<Dimension>
  // drawingStartedRef: MutableRefObject<boolean>
  // onDrawObjRef: MutableRefObject<fabric.Object | null>
  // boundaryRef: MutableRefObject<{ x: number[]; y: number[] }>
}) => {
  // const prevMousePosition = useRef<Point>({ x: 0, y: 0 })
  // const mousePosition = useRef<Point>({ x: 0, y: 0 })
  // console.log(boundaryRef, drawingStartedRef) // TODO: remove

  const canvasHandler = {
    onMoving: (e: fabric.IEvent<Event>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const obj = e.target as any
      setLinePosition(obj)
    }
  }

  return { canvasHandler }
}
