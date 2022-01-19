import { MutableRefObject, useEffect, useMemo, useRef } from 'react'
import { Dimension } from '../interface/basic'
import { Point } from '../label/PointLabel'
import { UseFocusReturnProps } from './useFocus'
import { State, UseStateStackReturnProps } from './useStateStack'
import { UseColorsReturnProps } from './useColor'
import {
  isLabel,
  isLineEndpoint,
  isRect,
  Label,
  newLabelFromFabricObj
} from '../label/Label'
import { STROKE_WIDTH } from '../interface/config'
import { getBetween } from '../utils/math'

export const useCanvas = ({
  canvasRef,
  focus,
  isAnnosVisible,
  annoColors,
  imageDims,
  canvasDims,
  boundary,
  offset,
  scale,
  stateStack
}: {
  canvasRef: MutableRefObject<fabric.Canvas | null>
  focus: UseFocusReturnProps
  isAnnosVisible: boolean
  annoColors: UseColorsReturnProps
  imageDims: Dimension
  canvasDims: Dimension
  boundary: { x: number[]; y: number[] }
  offset: Point
  scale: number
  stateStack: UseStateStackReturnProps
}) => {
  const canvas = canvasRef.current!
  const canvasLabelsCount =
    canvas && canvas.getObjects ? canvas.getObjects().filter(isLabel).length : 0
  const listenersRef = useRef<object>({})
  const listeners = listenersRef.current

  const { nowState, push: pushState } = stateStack
  const { setFocus, isFocused } = focus
  const { isDrawing, objectId: focusObj, categoryName: focusCate } = focus.now

  // TODO: remove
  let nothing: any = { imageDims, canvasDims, boundary, setObject: setFocus }
  nothing = !nothing

  // render lock used to avoid whole cycle callback caused by canvas changed which will ruin the canvas
  const renderLock = useRef<boolean>(false)
  const setRenderLock = () => {
    renderLock.current = true
  }
  const getRenderLock = () => {
    const nowLock = renderLock.current
    renderLock.current = false // if it was queried, unlock
    return nowLock
  }

  /**
   * Set line's position if moving its endpoint
   * @param event canvas' fabric object moving event
   */
  const setLinePositionIfMoveEndpoint = (object?: fabric.Object) => {
    if (object && isLineEndpoint(object)) {
      const { left, top, line, _id } = object as any // try to get attributes
      // judge if it is line
      line.set({
        [`x${_id}`]: left - STROKE_WIDTH / 2,
        [`y${_id}`]: top - STROKE_WIDTH / 2
      })
    }
  }

  // Sync state to canvas if state changed
  useEffect(() => {
    actions.syncStateToCanvas(nowState)
  }, [nowState])

  // Sync Canvas to state when the number of Objects in Canvas changes(mostly incrase) and not equal to state's label's count.
  useEffect(() => {
    canvasLabelsCount !== nowState.length && actions.syncCanvasToState()
  }, [canvasLabelsCount])

  // Set objects' visibale attribute in canvas when isDrawing or focus changed
  useEffect(() => {
    if (!canvas) return
    isDrawing && canvas.discardActiveObject()
    canvas.forEachObject((obj: fabric.Object) => {
      const { categoryName, id, type } = obj as any
      obj.visible = isFocused(categoryName, id, type === 'textbox')
      if (isDrawing && focusObj === id && !['textbox', 'line'].includes(type))
        canvas.setActiveObject(obj)
    })
    canvas.renderAll()
  }, [isDrawing, focusObj, focusCate])

  const actions = useMemo(
    () => ({
      syncCanvasToState: () => {
        console.log('syncCanvasToCanvas called') // TODO: remove

        const allCanvasObjects = canvas.getObjects().filter(isLabel)
        const newState: Label[] = allCanvasObjects.map((obj) =>
          newLabelFromFabricObj({ obj, offset, scale })
        )
        pushState && pushState(newState)
        setRenderLock() // avoid useEffect hook invoke syncStateToCanvas method
      },

      syncStateToCanvas: (nowState: State, forceVisable: boolean = false) => {
        if (!canvas || getRenderLock()) return
        console.log('syncStateToCanvas called') // TODO: remove

        canvas.remove(...canvas.getObjects())
        nowState.forEach((anno: Label) => {
          const { categoryName } = anno
          const currentColor = annoColors.get(categoryName!)
          const visible = forceVisable || isAnnosVisible // && isFocused(categoryName, id))
          const fabricObjects = anno.getFabricObjects({ currentColor, visible })
          canvas.add(...Object.values(fabricObjects))
        })
        canvas.renderAll()
      },

      loadListeners: (newListeners: object) => {
        if (!canvas) return
        Object.assign(listeners, newListeners) // save new listeners
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
    'object:moving': (e: fabric.IEvent) => {
      setLinePositionIfMoveEndpoint(e.target)
    },
    'object:modified': () => {
      const obj: any = canvas.getActiveObject()
      const _boundary = JSON.parse(JSON.stringify(boundary)) // deep clone to avoid rect-type calculate influences
      if (isRect(obj)) {
        _boundary.x[1] -= obj.getScaledWidth()
        _boundary.y[1] -= obj.getScaledHeight()
      }

      obj.left = getBetween(obj.left, ..._boundary.x)
      obj.top = getBetween(obj.top, ..._boundary.y)
      setLinePositionIfMoveEndpoint(obj)

      actions.syncCanvasToState()
    },

    // Sync canvas's selection to focus
    'selection:created': (e: any) => {
      const object = e.target
      setFocus({ object })
    },
    'selection:cleared': (e: any) => {
      e.e && setFocus({})
    }
  })

  canvas && actions.loadListeners(listeners) // If canvas no null, mount listeners
  return { loadListeners: actions.loadListeners }
}
