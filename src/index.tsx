/* eslint-disable no-unused-vars */
import * as React from 'react'
import { fabric } from 'fabric'
import { useEffect, useRef, useState } from 'react'
import {
  Point,
  RectLabel,
  PointLabel,
  LineLabel
} from './interface/annotations'
import { Focus, ImageObject } from './interface/shape'

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuAlt2Icon,
  MenuAlt3Icon,
  MenuAlt4Icon,
  MenuIcon,
  TrashIcon,
  CogIcon
} from '@heroicons/react/solid'
import {
  HeavyFloppyIcon,
  LineIcon,
  PointIcon,
  RectangleIcon,
  RedoIcon,
  ResetIcon,
  UndoIcon
} from './components/icons'
import { isTouchEvt } from './utils/mouse'
import { getBetween, getDistance } from './utils/math'
import {
  getAbbreviacion,
  getAllCategoryNames,
  getRandomColors,
  groupBy,
  parseCategorysAndColors
} from './utils/categorys&colors'
import Draggable from 'react-draggable'
import { CloseButton } from './components/buttons/closeBtn'
import { StateStack } from './class/stateStack'

export const ImageAnnotater = ({
  imagesList,
  index,
  colors,
  onPrevious,
  onNext,
  onClose,
  isAnnotationsVisible = true,
  close = true
}: {
  imagesList: any[]
  index: number
  colors?: string[]
  onPrevious?: Function
  onNext?: Function
  onClose?: Function
  isAnnotationsVisible?: boolean
  close?: boolean
}) => {
  const [isAnnotatorOpen, setIsAnnotatorOpen] = useState(close)
  if (!close) return null

  // Handle inputs with old shape
  // TODO: remove
  imagesList = imagesList.map((img) => {
    return {
      ...img,
      annotations: img.annotations.map((anno: any, id: number) => {
        const { x, y, w, h, category } = anno
        return new RectLabel({ x, y, w, h, id, categoryName: category })
      })
    }
  })

  /** Config **/
  const strokeWidth = 1.5
  const radius = 3
  const transparent = 'rgba(255,0,0,0)'
  const isTouchScreen =
    'ontouchstart' in window ||
    (navigator as any).maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  const newCategoryName = 'new_category'
  const rectDefaultConfig: fabric.IRectOptions | any = {
    lockRotation: true,
    fill: transparent,
    strokeWidth: strokeWidth,
    noScaleCache: false,
    strokeUniform: true,
    hasBorders: false,
    cornerSize: 8,
    transparentCorners: false,
    perPixelTargetFind: true,
    selectable: !isTouchScreen,
    _controlsVisibility: { mtr: false }
  }
  const textboxDefaultConfig: fabric.ITextboxOptions = {
    fill: 'black',
    selectable: false,
    hoverCursor: 'default',
    fontSize: radius * 2
  }
  const pointDefaultConfig: fabric.ICircleOptions = {
    strokeWidth: strokeWidth,
    fill: transparent,
    hasControls: false,
    hasBorders: false,
    selectable: !isTouchScreen,
    originX: 'center',
    originY: 'center',
    radius: radius
  }
  const lineDefaultConfig: fabric.ILineOptions = {
    strokeWidth: strokeWidth,
    hasBorders: false,
    hasControls: false,
    strokeUniform: true,
    selectable: false,
    hoverCursor: 'default',
    visible: true
  }

  /** Handle inputs **/
  const [imgObj, setImgObj] = useState<ImageObject>(imagesList[index])
  const indexR = useRef<number>(index)
  const categoryNames = getAllCategoryNames(
    imagesList.map((image) => image.annotations)
  )

  const { categoryColors, extendsColors } = parseCategorysAndColors(
    categoryNames,
    colors || []
  )

  /** Initialize variable **/
  const _stateStack = new StateStack()
  const [stateStack] = useState<StateStack>(_stateStack) // make stateStack as a state

  // Concerned attributes of annotations
  const [focus, _setFocus] = useState<Focus>({
    isDrawing: null,
    categoryName: null,
    objectId: null
  })
  const setFocus = (data: Focus) => {
    _setFocus({ ...focus, ...data })
  }

  // React Element References
  const imgElRef = useRef(null)
  const canvasElRef = useRef(null)

  // References as Variables for long life cycle, end with R
  const canvasR = useRef<fabric.Canvas | null>(null)
  const offsetR = useRef<Point>({ x: 0, y: 0 }) // Image object edge offset to canvas edge
  const scaleR = useRef<number>(1) // Scale of image in canvas to originael
  const boundaryR = useRef<{ x: number[]; y: number[] }>({ x: [], y: [] }) // images boundary on canvas

  // for zoom/pan/drag
  const isPanningR = useRef<boolean>(false)
  const lastPositionR = useRef<Point>({ x: 0, y: 0 })
  // const pinchGesture = useRef<PinchGesture | null>(null) // transport code from origin

  // for drawing
  const isDrawingR = useRef<string | null>(null)
  isDrawingR.current = focus.isDrawing!
  const drawingStartedR = useRef(false)
  const onDrawObjR = useRef<fabric.Object | null>(null)
  const originPositionR = useRef<Point>({ x: 0, y: 0 })
  const focusCategoryR = useRef<string | null>(null)
  focusCategoryR.current = focus.categoryName as string
  const categoryColorsR = useRef(categoryColors)

  // for categories panel
  const [selectBarFoldingState, _setSelectBarFoldingState] = useState(0)
  const setSelectBarFoldingState = () => {
    _setSelectBarFoldingState((selectBarFoldingState + 1) % 4)
  }
  const [groupedAnnotations, setGroupedAnnotations] = useState({})
  const MENU_ICONS = [
    <MenuIcon key='0' />,
    <MenuAlt2Icon key='1' />,
    <MenuAlt3Icon key='2' />,
    <MenuAlt4Icon key='3' />
  ]

  /** Methods **/
  /**
   * update actions status and grouped annotations if state stack or its pointer changes
   */
  const synchronizeStatus = () => {
    setGroupedAnnotations(
      // synchronize groupedAnnotations make category panel refresh
      groupBy(stateStack.nowState(), 'categoryName')
    )
  }

  /**
   * Determine whether it is concerned by the user.
   * @param categoryName object's category name
   * @param id object's id
   * @returns boolean-is it the target which users focus
   */
  const isFocused = (
    categoryName: string | null,
    id: number,
    isText: boolean = false
  ) => {
    return (
      !focus.isDrawing &&
      (focus.categoryName === null ||
        (focus.categoryName === categoryName &&
          (focus.objectId === null || (focus.objectId === id && !isText))))
    )
  }

  /**
   *
   * @param obj target object
   * @param labelType 'Rect' | 'Line'
   * @returns is the obj invalid
   */
  const isInvalid = (obj: any, labelType: string | null) => {
    return labelType === 'Rect'
      ? obj.width <= strokeWidth || obj.height <= strokeWidth
      : labelType === 'Line'
      ? getDistance(
          ...obj.endpoints.map((circle: any) => circle.getPointByOrigin())
        ) <
        (radius + strokeWidth) * 2
      : false
  }

  /**
   * set endpoint's corresponding line's position
   * @param endpoint Line's one endpoint
   */
  const setLinePosition = (endpoint: fabric.Circle) => {
    const { left, top, line, _id } = endpoint as any
    if (line && _id) {
      line.set({
        [`x${_id}`]: left - strokeWidth / 2,
        [`y${_id}`]: top - strokeWidth / 2
      })
    }
  }

  /**
   * Draw objects from state
   * @param state canvas existed annotations in history
   */
  const drawObjectsFromState = (
    state: (RectLabel | PointLabel | LineLabel)[],
    forceVisable: boolean = false
  ) => {
    // TODO: remove this part
    console.log('Draw objects from state', state) // hint

    const canvas = canvasR.current
    if (!canvas) return

    state.forEach((anno: RectLabel | PointLabel | LineLabel) => {
      if (anno.type === 'Rect') {
        const { x, y, w, h, id, categoryName } = anno
        const isVisible =
          forceVisable || (isAnnotationsVisible && isFocused(categoryName, id))
        const color = categoryColorsR.current[categoryName!]

        const rect = new fabric.Rect({
          ...rectDefaultConfig,
          left: x,
          top: y,
          width: w,
          height: h,
          visible: isVisible,
          stroke: color
        })
        rect.setOptions({ id, categoryName, labelType: 'Rect' })

        const textbox = new fabric.Textbox(id.toString(), {
          ...textboxDefaultConfig,
          left: x + strokeWidth,
          top: y + strokeWidth,
          backgroundColor: color,
          visible: isVisible,
          fontSize: Math.min(14, w / 2, h / 2)
        })
        textbox.setOptions({ id, categoryName, labelType: 'Rect' })

        canvas.add(rect, textbox)
      } else if (anno.type === 'Point') {
        const { x, y, id, categoryName } = anno
        const isVisible =
          forceVisable || (isAnnotationsVisible && isFocused(categoryName, id))
        const color = categoryColorsR.current[categoryName!]

        const point = new fabric.Circle({
          ...pointDefaultConfig,
          left: x,
          top: y,
          radius: radius,
          fill: color,
          stroke: transparent,
          visible: isVisible
        })
        point.setOptions({ id, categoryName, color, labelType: 'Point' })

        const textbox = new fabric.Textbox(id.toString(), {
          ...textboxDefaultConfig,
          left: x + radius - strokeWidth / 2,
          top: y - radius + strokeWidth / 2,
          originY: 'bottom',
          backgroundColor: color,
          visible: isVisible
        })
        textbox.setOptions({ id, categoryName, labelType: 'Point' })

        canvas.add(point, textbox)
      } else if (anno.type === 'Line') {
        const { x, y, _x, _y, id, categoryName } = anno
        const isVisible =
          forceVisable || (isAnnotationsVisible && isFocused(categoryName, id))
        const color = categoryColorsR.current[categoryName!]

        const line = new fabric.Line(
          [x, y, _x, _y].map((coord) => coord - strokeWidth / 2),
          {
            ...lineDefaultConfig,
            stroke: color,
            visible: isVisible
          }
        )
        const endpoints = [
          [x, y],
          [_x, _y]
        ].map((coord, _id) => {
          const endpoint = new fabric.Circle({
            ...pointDefaultConfig,
            left: coord[0],
            top: coord[1],
            fill: color,
            stroke: transparent,
            visible: isVisible
          })
          endpoint.setOptions({
            id,
            _id: _id + 1,
            categoryName,
            color,
            line,
            labelType: 'Line'
          })
          return endpoint
        })

        const topPoint = endpoints.sort((a, b) => a.top! - b.top!)[0]

        const textbox = new fabric.Textbox(id.toString(), {
          ...textboxDefaultConfig,
          left: topPoint.left!,
          top: topPoint.top! - radius,
          originX: 'center',
          originY: 'bottom',
          backgroundColor: color,
          visible: isVisible
        })
        textbox.setOptions({ id, categoryName, labelType: 'Line' })

        line.setOptions({ id, categoryName, labelType: 'Line', endpoints })
        canvas.add(line, textbox, ...endpoints)
      }
    })

    canvas.renderAll()
  }

  const drawStartFromCursor = (event: fabric.IEvent) => {
    const canvas = canvasR.current
    if (!canvas) return

    const { x: nowX, y: nowY } = canvas.getPointer(event.e)
    const boundary = boundaryR.current
    const x = getBetween(nowX, ...boundary.x)
    const y = getBetween(nowY, ...boundary.y)
    originPositionR.current = { x, y }

    // Calculate id、category and its color
    const categoryName = focusCategoryR.current || newCategoryName
    const id = Math.max(-1, ...stateStack.nowState().map((anno) => anno.id)) + 1
    const allColors = Object.values(categoryColorsR.current)
    categoryColorsR.current[categoryName] =
      categoryColorsR.current[categoryName] ||
      extendsColors.filter((color) => !allColors.includes(color))[0] ||
      getRandomColors().filter((color) => !allColors.includes(color))[0] // if category's color is not existed, choice one from extends or random one.
    const color = categoryColorsR.current[categoryName]

    if (isDrawingR.current === 'Rect') {
      // start to draw a rectangle and its text
      const rect = new fabric.Rect({
        ...rectDefaultConfig,
        left: x - strokeWidth,
        top: y - strokeWidth,
        stroke: color
      })
      rect.setOptions({ id, categoryName, labelType: 'Rect' })

      const textbox = new fabric.Textbox(id.toString(), {
        ...textboxDefaultConfig,
        backgroundColor: color,
        visible: false
      })
      textbox.setOptions({ id, categoryName, labelType: 'Rect' })

      canvas.add(rect, textbox)
      onDrawObjR.current = rect
    } else if (isDrawingR.current === 'Point') {
      const point = new fabric.Circle({
        ...pointDefaultConfig,
        left: x,
        top: y,
        stroke: color
      })
      point.setOptions({ id, categoryName, color, labelType: 'Point' })

      const textbox = new fabric.Textbox(id.toString(), {
        ...textboxDefaultConfig,
        originY: 'bottom',
        backgroundColor: color,
        visible: false
      })
      textbox.setOptions({ id, categoryName, labelType: 'Point' })

      canvas.add(point, textbox)
      onDrawObjR.current = point
    } else if (isDrawingR.current === 'Line') {
      const line = new fabric.Line(
        [x, y, x, y].map((coord) => coord - strokeWidth / 2),
        {
          ...lineDefaultConfig,
          stroke: color
        }
      )
      const endpoints = [...Array(2).keys()].map((_id) => {
        const endpoint = new fabric.Circle({
          ...pointDefaultConfig,
          left: x,
          top: y,
          fill: color,
          stroke: transparent
        })
        endpoint.setOptions({
          id,
          _id: _id + 1,
          categoryName,
          color,
          labelType: 'Line',
          line
        })
        return endpoint
      })
      line.setOptions({ id, categoryName, labelType: 'Line', endpoints })

      const textbox = new fabric.Textbox(id.toString(), {
        ...textboxDefaultConfig,
        originX: 'center',
        originY: 'bottom',
        backgroundColor: color,
        visible: false
      })
      textbox.setOptions({ id, categoryName, labelType: 'Line' })

      canvas.add(line, textbox, ...endpoints)
      onDrawObjR.current = line
    }

    drawingStartedR.current = true
  }

  /**
   * called when is drawing and mouse is up
   */
  const drawEndAtCursor = () => {
    const canvas = canvasR.current
    if (!canvas) return

    const obj = onDrawObjR.current as any

    if (isInvalid(obj, isDrawingR.current)) {
      canvas.remove(obj)
      canvas.remove(...canvas.getObjects().filter((o: any) => o.id === obj.id))
      setFocus({ isDrawing: null })
    } else {
      cSave()
      setFocus({
        isDrawing: null,
        objectId: obj.id,
        categoryName: obj.categoryName
      })
      canvas.setActiveObject(obj.labelType !== 'Line' ? obj : obj.endpoints[1])
    }

    drawingStartedR.current = false
    onDrawObjR.current = null
  }

  /**
   * Called when imgObj or window changed
   */
  const onImgLoad = () => {
    console.log('onImgLoad was called') // hint
    console.log(onClose) // TODO: remove

    // Get the Elements attributes and calculate the variables
    const img: any = imgElRef.current
    const { width: cw, height: ch } = img.getBoundingClientRect()
    const CanvasExtendedDiv = document.getElementById('canvas_extended')
    const CanvasExtendedDivAttrs = (
      CanvasExtendedDiv as HTMLElement
    ).getBoundingClientRect()
    const cew = CanvasExtendedDivAttrs.width
    const ceh = CanvasExtendedDivAttrs.height - 36 // 36 is the height of the operation bar
    offsetR.current = { x: (cew - cw) / 2, y: (ceh - ch) / 2 }
    scaleR.current = (cw / imgObj.imageWidth + ch / imgObj.imageHeight) / 2
    boundaryR.current = {
      x: [(cew - cw) / 2, (cew + cw) / 2],
      y: [(ceh - ch) / 2, (ceh + ch) / 2]
    }

    // Initialize state stack & focus & actions status & grouped annotations
    stateStack.pushState(
      imgObj.annotations.map((anno) =>
        anno.scaleTransform(scaleR.current, offsetR.current)
      )
    )
    setFocus({ isDrawing: null, objectId: null }) // keep category focus when switching images, so we can quickly browse one specific category objects on all images
    synchronizeStatus()

    // If there is not currently canvas, new one and set its attributes
    if (canvasR.current === null) {
      canvasR.current = new fabric.Canvas(canvasElRef.current, {
        defaultCursor: 'default',
        selection: false,
        targetFindTolerance: 5,
        uniformScaling: false
      })

      const lowerCanvasEl = canvasR.current.getElement()
      const canvasContainerEl = lowerCanvasEl.parentElement as HTMLElement
      canvasContainerEl.style.position = 'absolute'
      canvasContainerEl.style.top = '0'
      canvasContainerEl.classList.add('bg-gray-200')
      canvasContainerEl.style.touchAction = 'none'

      lowerCanvasEl.classList.remove('hidden')
      const upperCanvasEl = lowerCanvasEl.nextElementSibling as Element
      upperCanvasEl.classList.remove('hidden')
    }

    // Initialize canvas viewBox
    const canvas = canvasR.current
    canvas.clear()
    canvas.setWidth(cew)
    canvas.setHeight(ceh)
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0])

    // Add image to canvas
    canvas.add(
      new fabric.Image(img, {
        left: offsetR.current.x,
        top: offsetR.current.y,
        scaleX: scaleR.current,
        scaleY: scaleR.current,
        hasBorders: false,
        hasControls: false,
        selectable: false,
        hoverCursor: 'default'
      })
    )

    // Render annotations if existed
    drawObjectsFromState(stateStack.nowState())

    canvas.renderAll()
    canvas.zoomToPoint(new fabric.Point(cew / 2, ceh / 2), 1) // TODO: use math to calculate the rate to make the images biggest

    // Mouse events listener
    canvas.off('mouse:wheel') // remove old eventHandler
    // update eventHandler
    canvas.on('mouse:wheel', (o) => {
      const evt = o.e as any as React.WheelEvent
      const delta = evt.deltaY
      const zoom = getBetween(canvas.getZoom() * 0.999 ** delta, 0.01, 20)
      canvas.zoomToPoint(
        new fabric.Point((evt as any).offsetX, (evt as any).offsetY),
        zoom
      )
      evt.preventDefault()
      evt.stopPropagation()

      const vpt: any = canvas.viewportTransform
      if (zoom < 1) {
        vpt[4] = (cew * (1 - zoom)) / 2
        vpt[5] = (ceh * (1 - zoom)) / 2
      } else {
        vpt[4] = getBetween(vpt[4], cew * (1 - zoom), 0)
        vpt[5] = getBetween(vpt[5], cew * (1 - zoom), 0)
      }
    })

    canvas.off('mouse:down')
    canvas.on('mouse:down', (o) => {
      if (isDrawingR.current) {
        drawStartFromCursor(o) // drawing start
      } else {
        // if it's no drawing, it may be panning or select object
        const evt = o.e as any as React.MouseEvent | React.TouchEvent
        const { clientX, clientY } = isTouchEvt(evt) ? evt.touches[0] : evt
        lastPositionR.current = { x: clientX, y: clientY }

        const selectedObj = canvas.getActiveObject()
        isPanningR.current = !selectedObj

        setFocus({
          categoryName: (selectedObj as any)?.categoryName || null,
          objectId:
            (selectedObj as any)?.id === 0
              ? 0
              : (selectedObj as any)?.id || null
        })
      }
    })

    canvas.off('mouse:move')
    canvas.on('mouse:move', (o) => {
      if (isDrawingR.current && drawingStartedR.current) {
        const pointer = canvas.getPointer(o.e)
        const { x: origX, y: origY } = originPositionR.current
        const { x: nowX, y: nowY } = pointer
        const boundary = boundaryR.current
        const obj = onDrawObjR.current as any

        if (isDrawingR.current === 'Rect') {
          const left =
            getBetween(Math.min(origX, nowX), ...boundary.x) - strokeWidth
          const right = getBetween(Math.max(origX, nowX), ...boundary.x)
          const top =
            getBetween(Math.min(origY, nowY), ...boundary.y) - strokeWidth
          const bottom = getBetween(Math.max(origY, nowY), ...boundary.y)

          obj.set({
            left: left,
            top: top,
            width: right - left,
            height: bottom - top
          })
        } else if (isDrawingR.current === 'Point') {
          const left = getBetween(nowX, ...boundary.x)
          const top = getBetween(nowY, ...boundary.y)
          obj.set({ left, top })
        } else if (isDrawingR.current === 'Line') {
          const left = getBetween(nowX, ...boundary.x)
          const top = getBetween(nowY, ...boundary.y)
          obj.endpoints[1].set({ left, top })
          obj.set({ x2: left - strokeWidth / 2, y2: top - strokeWidth / 2 })
        }

        canvas.requestRenderAll()
      }

      if (isPanningR.current) {
        const evt = o.e as any as React.MouseEvent | React.TouchEvent
        const { clientX, clientY } = isTouchEvt(evt) ? evt.touches[0] : evt

        const zoom = canvas.getZoom()
        const vpt = canvas.viewportTransform as number[]
        if (zoom < 1) {
          vpt[4] = (cew * (1 - zoom)) / 2
          vpt[5] = (ceh * (1 - zoom)) / 2
        } else {
          vpt[4] += clientX - lastPositionR.current.x
          vpt[4] = getBetween(vpt[4], cew * (1 - zoom), 0)
          vpt[5] += clientY - lastPositionR.current.y
          vpt[5] = getBetween(vpt[5], ceh * (1 - zoom), 0)
        }

        canvas.requestRenderAll()
        lastPositionR.current = { x: clientX, y: clientY }
      }
    })

    canvas.off('mouse:up')
    canvas.on('mouse:up', () => {
      if (isDrawingR.current) {
        drawEndAtCursor()
      }

      // on mouse up we want to recalculate new interaction
      // for all objects, so we call setViewportTransform
      canvas.setViewportTransform(canvas.viewportTransform as number[])
      isPanningR.current = false

      // update corresponding textBox position
      const selectedObj: any = canvas.getActiveObject()
      if (selectedObj) {
        const theTextbox = canvas._objects.filter(
          (o: any) => o.type === 'textbox' && o.id === selectedObj.id
        )[0] as fabric.Textbox

        // selected object width/height dont get updated automatically
        const w = selectedObj.getScaledWidth() - strokeWidth
        const h = selectedObj.getScaledHeight() - strokeWidth

        const ndigits = (theTextbox.text as string).length
        const fontSize =
          selectedObj.labelType === 'Rect'
            ? Math.min(14, w / 2, h / 2)
            : radius * 1.5

        const textboxConfig: fabric.ITextboxOptions = {
          fontSize,
          width: (fontSize * ndigits) / 2
        }

        if (selectedObj.labelType === 'Rect') {
          textboxConfig.left = selectedObj.left + strokeWidth
          textboxConfig.top = selectedObj.top + strokeWidth
        } else if (selectedObj.labelType === 'Point') {
          textboxConfig.left = selectedObj.left + radius - strokeWidth / 2
          textboxConfig.top = selectedObj.top - radius + strokeWidth / 2
        } else if (selectedObj.labelType === 'Line') {
          const topPoint = selectedObj.line.endpoints.sort(
            (a: any, b: any) => a.top - b.top
          )[0]

          textboxConfig.left = topPoint.left
          textboxConfig.top = topPoint.top - radius
        }

        theTextbox.set({ ...textboxConfig })
      }
    })

    canvas.off('mouse:over')
    canvas.on('mouse:over', (e) => {
      const obj = e.target as any
      if (obj?.type === 'circle')
        obj.set({
          fill: transparent,
          stroke: obj.color
        })
      canvas.renderAll()
    })

    canvas.off('mouse:out')
    canvas.on('mouse:out', (e) => {
      const obj = e.target as any
      const onDrawObj = onDrawObjR.current as any

      if (obj?.type === 'circle' && (!onDrawObj || obj.id !== onDrawObj.id))
        obj.set({
          fill: obj.color,
          stroke: transparent
        })

      canvas.renderAll()
    })

    canvas.off('object:moving')
    canvas.on('object:moving', (e) => {
      const obj = e.target as any
      setLinePosition(obj)
    })

    canvas.off('object:modified')
    canvas.on('object:modified', () => {
      // get current offset and object
      const obj: any = canvas.getActiveObject()
      const boundary = JSON.parse(JSON.stringify(boundaryR.current)) // deep clone to avoid rect-type calculate influences

      // make sure the object's coordinates are in boundary
      // rectangle's origin point's boundary need minus rectangle's dimensions
      if (obj.labelType === 'Rect') {
        boundary.x[1] -= obj.getScaledWidth()
        boundary.y[1] -= obj.getScaledHeight()
      }

      obj.left = getBetween(obj.left, ...boundary.x)
      obj.top = getBetween(obj.top, ...boundary.y)
      setLinePosition(obj)

      cSave()
    })
  }

  /** Canvas context to states stack synchronizer **/
  /**
   * Save annotations on the canvas to the state stack
   */
  const cSave = () => {
    console.log('cSave has been called') // TODO: remove this hint

    const canvas = canvasR.current
    if (!canvas) return

    const nowState: (RectLabel | PointLabel | LineLabel)[] = []
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

    Rects.forEach((obj: fabric.Rect) => {
      nowState.push(
        new RectLabel({
          x: obj.left!,
          y: obj.top!,
          w: obj.getScaledWidth() - strokeWidth,
          h: obj.getScaledHeight() - strokeWidth,
          id: (obj as any).id,
          categoryName: (obj as any).categoryName,
          scale: scaleR.current,
          offset: offsetR.current,
          strokeWidth
        })
      )
    })

    Points.forEach((obj: fabric.Circle) => {
      nowState.push(
        new PointLabel({
          x: obj.left!,
          y: obj.top!,
          id: (obj as any).id,
          categoryName: (obj as any).categoryName,
          scale: scaleR.current,
          offset: offsetR.current,
          strokeWidth,
          radius
        })
      )
    })

    Lines.forEach((obj: fabric.Line) => {
      const { left: x, top: y } = (obj as any).endpoints[0]
      const { left: _x, top: _y } = (obj as any).endpoints[1]
      nowState.push(
        new LineLabel({
          x,
          y,
          _x,
          _y,
          id: (obj as any).id,
          categoryName: (obj as any).categoryName,
          scale: scaleR.current,
          offset: offsetR.current,
          strokeWidth
        })
      )
    })

    stateStack.pushState(nowState)
    synchronizeStatus() // update action status and grouped annotations because the state stack and its pointer has changed
    console.log(stateStack.nowState()) // TODO: remove this line because it just for debug
  }

  /**
   * Delete active annotation
   */
  const cDelete = () => {
    const canvas = canvasR.current
    if (!canvas) return

    const selectedObj = canvas.getActiveObject()

    if (selectedObj) {
      canvas.forEachObject((obj: any) => {
        if (obj.id === (selectedObj as any).id) canvas.remove(obj)
      })

      setFocus({ categoryName: null, objectId: null })
      cSave()
    }
  }

  /**
   * Undo
   */
  const cUndo = () => {
    const canvas = canvasR.current
    if (!canvas) return

    setFocus({ categoryName: null, objectId: null })
    canvas.remove(...canvas.getObjects().filter((o) => o.type !== 'image')) // remove all objects
    drawObjectsFromState(stateStack.prevState(), true)
    synchronizeStatus() // update action status because pointer has changed
  }

  /**
   * Redo
   */
  const cRedo = () => {
    const canvas = canvasR.current
    if (!canvas) return

    setFocus({ categoryName: null, objectId: null })
    canvas.remove(...canvas.getObjects().filter((o) => o.type !== 'image')) // remove all objects
    drawObjectsFromState(stateStack.nextState(), true)
    synchronizeStatus() // update action status because pointer has changed
  }

  /**
   * Reset
   */
  const cReset = () => {
    const canvas = canvasR.current
    if (!canvas) return

    setFocus({ categoryName: null, objectId: null })
    canvas.remove(...canvas.getObjects().filter((o) => o.type !== 'image')) // remove all objects

    drawObjectsFromState(stateStack.resetState(), true)
    synchronizeStatus() // update action status because pointer has changed
  }

  /** Images Switcher **/
  /**
   * switch to previous image
   */
  const showPrev = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    if (indexR.current) {
      indexR.current -= 1
      // allSave()  // TODO: implement save function
      setImgObj(imagesList[indexR.current])
      if (onPrevious) onPrevious() // TODO: add params
    }
  }

  /**
   * switch to next image
   */
  const showNext = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    if (indexR.current < imagesList.length - 1) {
      indexR.current += 1
      // allSave()  // TODO: implement save function
      setImgObj(imagesList[indexR.current])
      if (onNext) onNext() // TODO: add params
    }
  }

  /**
   * Handle keyboard events
   * @param event KeyboardEvent
   */
  const keyboardEventRouter = (event: KeyboardEvent) => {
    event.preventDefault() // prevent default event such as save html
    console.log(event) // TODO: remove
    switch (event.code) {
      case 'Backspace':
      case 'Delete':
        if (focus.objectId !== null) cDelete()
        break
      case 'KeyZ':
        if (
          (event.ctrlKey || event.metaKey) &&
          !event.shiftKey &&
          stateStack.can.undo
        )
          cUndo()
        else if (
          (event.ctrlKey || event.metaKey) &&
          event.shiftKey &&
          stateStack.can.redo
        )
          cRedo()
        break
      case 'KeyR':
        if ((event.ctrlKey || event.metaKey) && stateStack.can.reset) cReset()
        else if (!event.ctrlKey && !event.metaKey) {
          setFocus({
            isDrawing: focus.isDrawing === 'Rect' ? null : 'Rect',
            objectId: null
          })
        }
        break
      case 'KeyO':
        setFocus({
          isDrawing: focus.isDrawing === 'Point' ? null : 'Point',
          objectId: null
        })
        break
      case 'KeyL':
        setFocus({
          isDrawing: focus.isDrawing === 'Line' ? null : 'Line',
          objectId: null
        })
        break
      case 'Period':
      case 'ArrowRight':
        showNext()
        break
      case 'Comma':
      case 'ArrowLeft':
        showPrev()
        break
      default:
        break
    }
  }

  /** Listener **/
  window.onresize = onImgLoad
  window.onkeydown = keyboardEventRouter

  useEffect(() => {
    const canvas = canvasR.current
    if (!canvas) return

    if (focus.isDrawing) canvas.discardActiveObject() // to hide active object controls
    canvas.forEachObject((obj: any) => {
      if (obj.type !== 'image') {
        obj.visible = isFocused(
          obj.categoryName,
          obj.id,
          obj.type === 'textbox'
        )
        if (
          !['textbox', 'line'].includes(obj.type) &&
          obj.id === focus.objectId
        )
          canvas.setActiveObject(obj)
      }
    })
    canvas.renderAll()
  }, [
    focus.objectId,
    focus.categoryName,
    focus.isDrawing,
    isAnnotationsVisible
  ])

  return isAnnotatorOpen ? (
    <div className='w-full h-full flex flex-col justify-center items-center relative'>
      <div
        className='h-full relative pb-7 md:pb-9 select-none w-full flex justify-center items-center overflow-y-hidden'
        id='canvas_extended'
      >
        <img
          alt={imgObj.fileName}
          title={imgObj.fileName}
          src={imgObj.blobUrl}
          loading='lazy'
          className='object-contain max-h-full invisible'
          onLoad={onImgLoad}
          ref={imgElRef}
        />
        <canvas ref={canvasElRef} className='hidden' />
      </div>

      <div className='absolute w-full h-full pb-7 md:pb-9 invisible'>
        <div
          className={`relative h-full p-2 overflow-hidden ${
            isAnnotationsVisible ? '' : 'hidden'
          }`}
        >
          <Draggable
            bounds='parent'
            handle='#cate_handle'
            cancel='.selbar-state-icon'
          >
            <div className='bg-gray-100 bg-opacity-0 absolute top-2 right-2 visible rounded-md max-h-full w-24 flex flex-col items-end text-xs shadow-lg select-none'>
              <div
                id='cate_handle'
                className='bg-indigo-400 py-2 px-2 w-full rounded-t-md flex justify-between'
              >
                <span
                  className='h-4 w-4 text-gray-700 selbar-state-icon'
                  onClick={setSelectBarFoldingState}
                >
                  {MENU_ICONS[selectBarFoldingState]}
                </span>
                category
              </div>
              <div
                className={`h-full w-full overflow-y-auto ${
                  selectBarFoldingState === 3 ? 'hidden' : ''
                }`}
              >
                {Object.entries(groupedAnnotations).map(
                  (
                    [category, annotations]: [
                      string,
                      (RectLabel | PointLabel | LineLabel)[]
                    ],
                    index: number
                  ) => (
                    <div
                      key={index}
                      className={`px-2 flex flex-col items-end w-full py-1 border-indigo-600 ${
                        focus.categoryName === category ? 'border-l-8' : ''
                      }`}
                      style={{
                        backgroundColor: categoryColorsR.current[category]
                      }}
                      onClick={() => {
                        setFocus({ categoryName: category })
                      }}
                    >
                      <div
                        className={`pb-1 static w-full flex justify-end ${
                          selectBarFoldingState === 2 &&
                          focus.categoryName !== category
                            ? 'hidden'
                            : ''
                        }`}
                      >
                        <div
                          className={`absolute left-0 transform -translate-x-6 md:-translate-x-8 ${
                            focus.isDrawing || focus.categoryName !== category
                              ? 'invisible'
                              : 'visible'
                          }`}
                        >
                          <CogIcon
                            className={`w-6 h-6 md:w-8 md:h-8 ${
                              // showCateEditBar TODO
                              category ? 'text-indigo-600' : 'text-gray-700'
                            } `}
                          />
                        </div>
                        <span>{getAbbreviacion(category, 7)}</span>
                      </div>
                      <div>
                        <div
                          className={`grid grid-cols-3 gap-1 mr-0.5 flex-row-reverse ${
                            selectBarFoldingState === 1 &&
                            focus.categoryName !== category
                              ? 'hidden'
                              : ''
                          } `}
                        >
                          {annotations.map((anno, idx) => (
                            <div
                              key={idx}
                              className={`h-5 w-5 rounded-md flex justify-center items-center ${
                                focus.objectId === anno.id
                                  ? 'bg-indigo-600 text-gray-100'
                                  : 'bg-gray-200'
                              } ${
                                isTouchScreen
                                  ? ''
                                  : 'hover:bg-indigo-600 hover:text-gray-100'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation()
                                setFocus({
                                  categoryName: category,
                                  objectId: anno.id
                                })
                              }}
                            >
                              <span>{anno.id}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </Draggable>

          {/* <Draggable bounds='parent' handle='#cate_edit_handle'>
          <div
            className={`bg-gray-100 bg-opacity-0 absolute top-2 left-2 visible rounded-md max-h-full flex flex-col items-end text-xs shadow-lg select-none ${
              showCateEditBar ? '' : 'hidden'
            }`}
          >
            <div className='flex rounded-md'>
              <div
                id='cate_edit_handle'
                className='relative inline-flex items-center space-x-2 px-2 rounded-l-md text-gray-100 bg-indigo-400'
              >
                <HandIcon className='h-4 w-4' aria-hidden='true' />
              </div>
              <div className='relative flex items-stretch flex-grow'>
                <div className='absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-600'>
                  <TagIcon className='h-4 w-4' aria-hidden='true' />
                </div>
                <input
                  type='text'
                  id='edit-category-bar'
                  className='w-24 md:w-28 border-0 pl-8 pr-0 text-xs focus:outline-none'
                  placeholder={canvasCtx.cateOI || newCategoryName}
                  value={cateCandid}
                  onChange={(evt) => {
                    evt.preventDefault()
                    const value = evt.target.value
                    setCateCandid(value)
                  }}
                />
                <div className='group'>
                  <div
                    className='h-full flex items-center bg-white text-gray-600 px-2'
                    onClick={() => {
                      setShowCateListBar(!showCateListBar)
                    }}
                  >
                    {showCateListBar ? (
                      <ChevronUpIcon className='h-4 w-4 transform translate-y-0.5' />
                    ) : (
                      <ChevronDownIcon className='h-4 w-4 transform translate-y-0.5' />
                    )}
                  </div>
                  <div
                    className={`absolute mt-1 left-0 w-full ${
                      showCateListBar ? '' : 'hidden'
                    } flex flex-col bg-gray-100 bg-opacity-0 max-h-64 overflow-scroll rounded-md shadow-lg`}
                  >
                    {
                      // don't inplace sort categories here, otherwise when adding new named category
                      // it may change existed category's color
                      // e.g. add cateA -> cateC -> cateB -> cateE, when adding cateE, sort (A,C,B) here
                      // before aSave() will switch cateC & cateB's color, but canvas box stroke is still
                      // the colors before update, unless call drawObjectsFromState to redraw afterwards
                      // afterall, changing existed colors are not good idea, so don't inplace sort here
                      [...categories]
                        .sort((ca: string, cb: string) => {
                          return ca < cb ? -1 : 1
                        })
                        .map((cate: string, idx: number) => (
                          <div
                            className={`text-xs py-2 w-full rounded-l-md ${
                              cate === cateCandid
                                ? 'border-l-6 border-indigo-600 px-2.5'
                                : 'px-4'
                            }`}
                            style={{ backgroundColor: colors[cate] }}
                            key={`cate-${idx}`}
                            onClick={() => {
                              setCateCandid(cate)
                            }}
                          >
                            <span className=''>{cate}</span>
                          </div>
                        ))
                    }
                  </div>
                </div>
              </div>
              <div className='grid grid-cols-3'>
                <button
                  className={`relative border-l border-r inline-flex items-center space-x-2 px-2 focus:outline-none bg-gray-100
                ${
                  canvasCtx.cateOI === cateCandid
                    ? 'text-gray-400'
                    : 'hover:bg-indigo-600 hover:text-gray-100'
                }`}
                  onClick={
                    canvasCtx.cateOI === cateCandid ? undefined : aSave
                  }
                >
                  <CheckIcon className='h-4 w-4' aria-hidden='true' />
                </button>
                <button
                  className='relative border-r inline-flex items-center space-x-2 px-2 bg-gray-100 hover:bg-indigo-600 hover:text-gray-100 focus:outline-none'
                  onClick={() => {
                    setShowCateEditBar(false)
                  }}
                >
                  <XIcon className='h-4 w-4' aria-hidden='true' />
                </button>
                <button
                  className={`relative inline-flex items-center space-x-2 px-2 rounded-r-md focus:outline-none bg-gray-100
                    ${
                      canvasCtx.cateOI === newCategoryName &&
                      cateCandid === newCategoryName
                        ? 'text-gray-400'
                        : 'hover:bg-indigo-600 hover:text-gray-100'
                    }`}
                  onClick={() => {
                    if (canvasCtx.cateOI !== cateCandid)
                      setCateCandid(canvasCtx.cateOI as unknown as string)
                    else if (cateCandid !== newCategoryName) aDelete()
                  }}
                >
                  {canvasCtx.cateOI === cateCandid ? (
                    <TrashIcon className='h-4 w-4' aria-hidden='true' />
                  ) : (
                    <RefreshIcon className='h-4 w-4' aria-hidden='true' />
                  )}
                </button>
              </div>
            </div>
          </div>
        </Draggable> */}
        </div>
      </div>

      <div className='flex justify-center space-x-1 absolute bottom-0 right-1 md:right-1/4'>
        <div
          onClick={showPrev}
          className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer
              ${
                indexR.current === 0
                  ? 'text-gray-400'
                  : 'hover:bg-indigo-600 hover:text-gray-100'
              }`}
        >
          <ChevronLeftIcon className='h-4 w-4' />
        </div>

        <div
          onClick={showNext}
          className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer
              ${
                indexR.current === imagesList.length - 1
                  ? 'text-gray-400'
                  : 'hover:bg-indigo-600 hover:text-gray-100'
              }`}
        >
          <ChevronRightIcon className='h-4 w-4' />
        </div>
      </div>

      <div
        className={`flex justify-center space-x-2 absolute bottom-0 ${
          isAnnotationsVisible ? '' : 'hidden'
        }`}
      >
        <div className='flex justify-center space-x-1'>
          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              focus.objectId !== null
                ? 'hover:bg-indigo-600 hover:text-gray-100'
                : 'text-gray-400'
            }`}
            onClick={focus.objectId !== null ? cDelete : undefined}
          >
            <TrashIcon className='h-4 w-4' />
          </div>

          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              focus.isDrawing === 'Rect' ? 'bg-indigo-600 text-gray-100' : ''
            }`}
            onClick={() => {
              setFocus({
                isDrawing: focus.isDrawing === 'Rect' ? null : 'Rect',
                objectId: null
              })
            }}
          >
            <RectangleIcon />
          </div>

          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              focus.isDrawing === 'Point' ? 'bg-indigo-600 text-gray-100' : ''
            }`}
            onClick={() => {
              setFocus({
                isDrawing: focus.isDrawing === 'Point' ? null : 'Point',
                objectId: null
              })
            }}
          >
            <PointIcon />
          </div>

          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              focus.isDrawing === 'Line' ? 'bg-indigo-600 text-gray-100' : ''
            }`}
            onClick={() => {
              setFocus({
                isDrawing: focus.isDrawing === 'Line' ? null : 'Line',
                objectId: null
              })
            }}
          >
            <LineIcon />
          </div>

          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              // can.undo
              stateStack.can.undo
                ? 'hover:bg-indigo-600 hover:text-gray-100'
                : 'text-gray-400'
            }`}
            onClick={stateStack.can.undo ? cUndo : undefined}
          >
            <UndoIcon />
          </div>
          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              stateStack.can.redo
                ? 'hover:bg-indigo-600 hover:text-gray-100'
                : 'text-gray-400'
            }
        `}
            onClick={stateStack.can.redo ? cRedo : undefined}
          >
            <RedoIcon />
          </div>

          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              stateStack.can.reset
                ? 'hover:bg-indigo-600 hover:text-gray-100'
                : 'text-gray-400'
            }`}
            onClick={stateStack.can.reset ? cReset : undefined}
          >
            <ResetIcon />
          </div>
          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              stateStack.can.save
                ? 'hover:bg-indigo-600 hover:text-gray-100'
                : 'text-gray-400'
            }`}
            // onClick={can.save ? allSave : undefined}
          >
            <HeavyFloppyIcon />
          </div>
        </div>
      </div>

      <div className='flex justify-center space-x-1 absolute bottom-0 left-1 md:left-1/4'>
        <CloseButton
          onClick={() => {
            setIsAnnotatorOpen(false)
            if (onClose) onClose() // TODO: add event as params
          }}
        />
      </div>
    </div>
  ) : null
}
