import { MutableRefObject, useMemo, useRef } from 'react'
import { Dimension, Label } from '../interface/basic'
import { Point } from '../label/PointLabel'
import { LineLabel } from '../label/LineLabel'
import { PointLabel } from '../label/PointLabel'
import { RectLabel } from '../label/RectLabel'
import { setLinePosition } from '../utils/util'

export const useCanvas = ({
  canvasRef,
  isAnnosVisible,
  categoryColorsRef,
  imageDims,
  canvasDims,
  boundary,
  offset,
  scale,
  pushState
}: {
  canvasRef: MutableRefObject<fabric.Canvas | null>
  isAnnosVisible: boolean
  categoryColorsRef: MutableRefObject<any>
  imageDims: Dimension
  canvasDims: Dimension
  boundary: { x: number[]; y: number[] } | null
  offset: Point
  scale: number
  pushState?: Function
}) => {
  const canvas = canvasRef.current!
  const listenersRef = useRef<object>({})
  const listeners = listenersRef.current
  // const colors = categoryColorsRef.current
  let nothing: any = {
    isAnnosVisible,
    categoryColorsRef,
    imageDims,
    canvasDims,
    boundary
  }
  nothing = 0
  console.log(nothing)

  const actions = useMemo(
    () => ({
      syncCanvasToState: () => {
        console.log('syncCanvasToState called') // TODO: remove

        const allCanvasObjects = canvas.getObjects()
        const Rects = allCanvasObjects.filter(
          (obj: any) => obj.type === 'rect' && obj.labelType === 'Rect'
        )
        const Points = allCanvasObjects.filter(
          (obj: any) => obj.type === 'circle' && obj.labelType === 'Point'
        )
        const Lines = allCanvasObjects.filter(
          (obj: any) => obj.type === 'line' && obj.labelType === 'Line'
        )

        const nowState: Label[] = [
          ...Rects.map((obj: fabric.Rect) => {
            return RectLabel.fromFabricRect({ obj, offset, scale })
          }),
          ...Points.map((obj: fabric.Circle) => {
            return PointLabel.fromFabricPoint({ obj, offset, scale })
          }),
          ...Lines.map((obj: fabric.Line) => {
            return LineLabel.fromFabricLine({ obj, offset, scale })
          })
        ]

        pushState && pushState(nowState)
      },

      loadListeners: (newListeners: object) => {
        // save new listeners
        Object.assign(listeners, newListeners)

        canvas.off() // remove all existed listeners
        Object.entries(listeners).forEach(([event, handler]) => {
          canvas.on(event, handler)
        })
      }
    }),
    [canvas]
  )

  // set default listeners and must after declare actions otherwise it will not work
  Object.assign(listeners, {
    'object:moving': (e: fabric.IEvent<Event>) => {
      setLinePosition(e.target as any)
    },
    'object:modified': () => {
      console.log('modified')
      actions.syncCanvasToState()
    }
  })

  // If canvas no null, mount listeners
  canvas && actions.loadListeners(listeners)

  return { ...actions }
}
