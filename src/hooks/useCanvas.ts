import { MutableRefObject, useEffect, useMemo, useRef } from 'react'
import { Label } from '../classes/Label'
import { STROKE_WIDTH } from '../interfaces/config'
import { getBetween } from '../utils'
import { isLabel, isLineEndpoint, isRect, newLabel } from '../utils/label'
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
  // TODO: remove
  const nothing = { annoColors }
  !nothing

  const canvas = canvasRef.current!
  const canvasLabelsCount =
    canvas && canvas.getObjects ? canvas.getObjects().filter(isLabel).length : 0
  const listenersRef = useRef<object>({})
  const listeners = listenersRef.current

  const { nowState, push: pushState } = stateStack
  const {
    nowFocus: { drawingType, objects: focusObjs, category: focusCate },
    canObjectShow,
    isFocused,
    setObjects
  } = focus

  const { offset, scale, boundary } = canvasProps

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

  /**
   * Update all labels' text position in canvas via regenerate them
   */
  const updateAllTextboxPosition = () => {
    const allCanvasObjects = canvas.getObjects().filter(isLabel)
    const allLabels = allCanvasObjects.map((obj) =>
      newLabel({ obj, offset, scale })
    )

    canvas.remove(...canvas.getObjects())
    allLabels.forEach((anno) => canvas.add(...anno.getFabricObjects({})))
  }

  // Sync state to canvas & focus if state changed
  useEffect(() => {
    actions.syncStateToCanvas(nowState) // sync state
    setObjects(nowState.filter(isFocused)) // sync focus
  }, [nowState])

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
      if (
        (drawingType || adjustMode) &&
        isFocused(obj) &&
        !['textbox', 'line'].includes(obj.type)
      )
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
          const fabricObjects = anno.getFabricObjects({ currentColor, visible })
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
    'object:moving': (e: fabric.IEvent) => {
      setLinePositionIfMoveEndpoint(e.target)
    },
    'object:modified': () => {
      const obj: any = canvas.getActiveObject()
      const _boundary = JSON.parse(JSON.stringify(boundary)) // deep clone to avoid rect-type calculate influences
      // rect's boundary need consider of its dimensions
      if (isRect(obj)) {
        _boundary.x[1] -= obj.getScaledWidth()
        _boundary.y[1] -= obj.getScaledHeight()
      }
      // as for other types label, they controlled by its endpoint
      obj.left = getBetween(obj.left, ..._boundary.x)
      obj.top = getBetween(obj.top, ..._boundary.y)
      setLinePositionIfMoveEndpoint(obj)

      actions.syncCanvasToState()
    },

    // Sync canvas's selection to focus
    'selection:created': (e: any) => {
      const obj = e.target
      const anno = newLabel({ obj, offset, scale })
      setObjects([anno])
    },
    'selection:cleared': (e: any) => e.e && setObjects()
  })

  canvas && actions.loadListeners(listeners) // If canvas no null, mount listeners
  return { loadListeners: actions.loadListeners }
}
