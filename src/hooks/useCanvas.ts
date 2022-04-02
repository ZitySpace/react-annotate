import { MutableRefObject, useEffect, useMemo, useRef } from 'react'
import { Boundary } from '../classes/Geometry/Boundary'
import { Point } from '../classes/Geometry/Point'
import { Label } from '../classes/Label'
import {
  isEndpoint,
  isLabel,
  isRect,
  newLabel,
  updateEndpointAssociatedLinesPosition
} from '../utils/label'
import { UseColorsReturnProps } from './useColor'
import { CanvasProps } from './useContainer'
import { UseFocusReturnProps } from './useFocus'
import { State, UseStateStackReturnProps } from './useStateStack'

export const useCanvas = ({
  canvasRef,
  canvasProps,
  focus,
  isAnnosVisible,
  annoColors,
  stateStack
}: {
  canvasRef: MutableRefObject<fabric.Canvas | null>
  canvasProps: CanvasProps
  focus: UseFocusReturnProps
  isAnnosVisible: boolean
  annoColors: UseColorsReturnProps
  stateStack: UseStateStackReturnProps
}) => {
  const canvas = canvasRef.current! // get canvas instance
  const canvasLabelsCount = // count of labels in canvas
    canvas && canvas.getObjects ? canvas.getObjects().filter(isLabel).length : 0
  const listenersRef = useRef<object>({})
  const listeners = listenersRef.current

  const { nowState, push: pushState } = stateStack
  const { offset, scale, imgBoundary } = canvasProps
  const {
    nowFocus: { drawingType, objects: focusObjs, category: focusCate },
    canObjectShow,
    isFocused,
    setObjects
  } = focus

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
   * Update all labels' text position in canvas via regenerate them
   */
  const updateAllTextboxPosition = () => {
    const currentLabelObjs = canvas.getObjects().filter(isLabel)
    const newObjects = currentLabelObjs.map((obj: any) =>
      newLabel({ obj, offset, scale }).getFabricObjects(
        annoColors.get(obj.category)
      )
    )
    canvas.remove(...canvas.getObjects()).add(...newObjects.flat())
  }

  /**
   * Update polygon's if the obj is polygon's endpoint
   */
  const updateEndpointAssociatedPolygon = (obj: fabric.Object) => {
    const { left, top, polygon, _id } = obj as any
    if (isEndpoint(obj) && polygon) polygon.points[_id] = new Point(left, top)
  }

  // Sync state to canvas & focus if state changed
  useEffect(() => {
    actions.syncStateToCanvas(nowState) // sync state
    setObjects(nowState.filter(isFocused)) // sync focus
  }, [JSON.stringify(nowState)]) // Deep compare

  // Sync Canvas to state when the number of Objects in Canvas changes(mostly incrase) and not equal to state's label's count.
  useEffect(() => {
    canvasLabelsCount !== nowState.length && actions.syncCanvasToState()
  }, [canvasLabelsCount])

  // Set objects' visibale attribute in canvas when drawingType or focus changed
  useEffect(() => {
    if (!canvas) return
    const adjustMode = focusObjs.length === 1

    !(drawingType || focusObjs.length || focusCate) &&
      updateAllTextboxPosition()
    if (drawingType || !adjustMode) canvas.discardActiveObject()
    canvas.forEachObject((obj: any) => {
      obj.visible = canObjectShow(obj, !(drawingType || adjustMode))
      if ((drawingType || adjustMode) && isFocused(obj) && isRect(obj))
        canvas.setActiveObject(obj)
    })
    canvas.renderAll()
  }, [drawingType, focusObjs, focusCate])

  const actions = useMemo(
    () => ({
      syncCanvasToState: () => {
        console.log('syncCanvasToState called') // TODO: remove

        const allCanvasObjects = canvas.getObjects().filter(isLabel)
        const newState: Label[] = allCanvasObjects.map((obj) =>
          newLabel({ obj, offset, scale })
        )
        pushState && pushState(newState)
        setRenderLock() // avoid useEffect hook invoke syncStateToCanvas method
      },

      syncStateToCanvas: (nowState: State, forceVisable: boolean = false) => {
        if (!canvas || getRenderLock()) return
        console.log('syncStateToCanvas called') // TODO: remove

        canvas.remove(...canvas.getObjects())
        nowState.forEach((anno: Label) => {
          const { category } = anno
          const currentColor = annoColors.get(category!)
          // TODO: ensure visible
          const visible = forceVisable || isAnnosVisible // && isFocused(categoryName, id))
          const fabricObjects = anno.getFabricObjects(currentColor, visible)
          canvas.add(...fabricObjects)
        })
        canvas.renderAll()
      },

      /**
       * Load event listeners to canvas.
       * @param newListeners listeners object which want to load
       */
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
    // when canvas's object is moving, sync its line's position if the object is line's endpoint
    'object:moving': (e: fabric.IEvent) =>
      updateEndpointAssociatedLinesPosition(e.target!),

    // when canvas's object was moved, ensure its position is in the image boundary
    'object:modified': () => {
      const obj: any = canvas.getActiveObject()
      const { x, y, _x, _y } = imgBoundary
      const _imgBoundary = new Boundary(x, y, _x, _y) // deep clone to avoid rect-type calculate influences
      // rect's boundary need consider of its dimensions
      if (isRect(obj)) {
        _imgBoundary._x -= obj.getScaledWidth()
        _imgBoundary._y -= obj.getScaledHeight()
      }
      // as for other types label, they controlled by its endpoint
      obj.set(_imgBoundary.within(obj))
      updateEndpointAssociatedLinesPosition(obj, true)
      updateEndpointAssociatedPolygon(obj)

      actions.syncCanvasToState()
    },

    // Sync canvas's selection to focus
    'selection:created': (e: any) => {
      const obj = e.target.polygon || e.target
      const anno = newLabel({ obj, offset, scale })
      setObjects([anno])
    },
    'selection:cleared': (e: any) => e.e && setObjects()
  })

  canvas && actions.loadListeners(listeners) // If canvas no null, mount listeners
  return { loadListeners: actions.loadListeners }
}
