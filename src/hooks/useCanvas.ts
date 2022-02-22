import { MutableRefObject, useEffect, useMemo, useRef } from 'react'
import {
  isLabel,
  isLineEndpoint,
  isRect,
  Label,
  newLabelFromFabricObj
} from '../classes/Label'
import { getBetween } from '../utils/math'
import { UseColorsReturnProps } from './useColor'
import { UseFocusReturnProps } from './useFocus'
import { State, UseStateStackReturnProps } from './useStateStack'
import { CanvasProps } from './useContainer'
import { STROKE_WIDTH } from '../interfaces/config'

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
      newLabelFromFabricObj({ obj, offset, scale })
    )

    canvas.remove(...canvas.getObjects())
    allLabels.forEach((anno) =>
      canvas.add(...Object.values(anno.getFabricObjects({})))
    )
  }

  // Sync state to canvas & focus if state changed
  useEffect(() => {
    actions.syncStateToCanvas(nowState) // sync state
    // sync focus
    const nowCates: string[] = []
    const nowIds: number[] = []
    nowState.forEach((anno: Label) => {
      nowCates.push(anno.categoryName!)
      nowIds.push(anno.id)
    })
    // reset focus if focused obj no exist anymore
    // if (!nowCates.includes(focusCate as string)) setObjects()
    // else if (!nowIds.includes(focusObj!)) setFocus({ categoryName: focusCate! })
  }, [nowState])

  // Sync Canvas to state when the number of Objects in Canvas changes(mostly incrase) and not equal to state's label's count.
  useEffect(() => {
    canvasLabelsCount !== nowState.length && actions.syncCanvasToState()
  }, [canvasLabelsCount])

  // Set objects' visibale attribute in canvas when drawingType or focus changed
  useEffect(() => {
    if (!canvas) return

    !(drawingType || focusObjs.length || focusCate) &&
      updateAllTextboxPosition()
    drawingType && canvas.discardActiveObject()
    canvas.forEachObject((obj: any) => {
      obj.visible = canObjectShow(obj, false)
      if (
        drawingType &&
        isFocused(obj) &&
        !['textbox', 'line'].includes(obj.type)
      )
        canvas.setActiveObject(obj)
    })
    console.log('canvas.renderAll()')
    canvas.renderAll()
  }, [drawingType, focusObjs, focusCate])
  // }, [focusObjs, focusObjs, focusCate])

  const actions = useMemo(
    () => ({
      syncCanvasToState: () => {
        console.log('syncCanvasToState called') // TODO: remove

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
          // TODO: ensure visible
          const visible = forceVisable || isAnnosVisible // && isFocused(categoryName, id))
          const fabricObjects = anno.getFabricObjects({ currentColor, visible })
          canvas.add(...Object.values(fabricObjects))
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
      const anno = newLabelFromFabricObj({ obj, offset, scale })
      setObjects([anno])
    },
    'selection:cleared': (e: any) => e.e && setObjects()
  })

  canvas && actions.loadListeners(listeners) // If canvas no null, mount listeners
  return { loadListeners: actions.loadListeners }
}
