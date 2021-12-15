/* eslint-disable camelcase */
import * as React from 'react'
import { fabric } from 'fabric'
// import Draggable from 'react-draggable'
// import { PinchGesture } from '@use-gesture/vanilla'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  // ChevronDownIcon,
  // ChevronUpIcon,
  XIcon,
  // MenuAlt2Icon,
  // MenuAlt3Icon,
  // MenuAlt4Icon,
  // MenuIcon,
  TrashIcon,
  ReplyIcon,
  // CheckIcon,
  RefreshIcon,
  PencilIcon
  // CogIcon,
  // TagIcon,
  // HandIcon
} from '@heroicons/react/solid'
import { useEffect, useRef, useState } from 'react'
// import randomColor from 'randomcolor'
import { HeavyFloppyIcon } from './components/icons'
// import md5 from 'md5'

// TODO: mock data remove
import { canvasCtxMock } from './mockdata'
import { ImageObject, RectLabel } from './interface/annotations'
// import { getLocalISOString } from './utils/time'

// type canvasStateType = {
//   x: number
//   y: number
//   w: number
//   h: number
//   category: string
//   unique_hash_z: string
//   text_id: string
//   timestamp_z: string
// }[]

// const cmap = randomColor({
//   seed: 19,
//   format: 'rgba',
//   alpha: 0.75,
//   count: 16
// })

export const ImageAnnotater = ({
  imagesList,
  index,
  categoryAndColors,
  onPrevious,
  onNext,
  onClose,
  isAnnotationsVisible = true
}: {
  imagesList: any[]
  index: number
  categoryAndColors: any
  onPrevious?: Function
  onNext?: Function
  onClose?: Function
  isAnnotationsVisible?: boolean
}) => {
  imagesList = imagesList.map((img) => {
    return {
      ...img,
      annotations: img.annotations.map((anno: any, id: number) => {
        const { x, y, w, h, category } = anno
        return new RectLabel({ x, y, w, h, id, categoryName: category })
      })
    }
  })
  const [imgObj, setImgObj] = useState<ImageObject>(imagesList[index])
  const indexRef = useRef(index)

  // let categories = Object.keys(categoryAndColors)
  const colors = categoryAndColors

  // ref
  const imgElRef = useRef(null)
  const canvasElRef = useRef(null)
  const canvasRef = useRef<fabric.Canvas | null>(null)

  const stateStackRef = useRef<any[]>([])
  const ptrInStackRef = useRef(0)

  const xoffset = useRef<number>(0)
  const yoffset = useRef<number>(0)
  const scale = useRef<number>(1)

  // for zoom/pan/drag
  const isPanning = useRef(false)
  const lastPosX = useRef(0)
  const lastPosY = useRef(0)
  // const pinchGesture = useRef<PinchGesture | null>(null)

  // context
  const [canvasCtx, _setCanvasCtx] = useState(canvasCtxMock)
  const setCanvasCtx = (data: object) => {
    _setCanvasCtx({ ...canvasCtx, ...data })
  }

  // for drawing
  // canvasCtx.isDrawing updates can't be reflected in
  // fabric canvas listeners, unless use a ref to connect to it
  const isDrawingRef = useRef(false)
  isDrawingRef.current = canvasCtx.isDrawing
  const onDrawObj = useRef<fabric.Object | null>(null)
  const originX = useRef(0)
  const originY = useRef(0)
  const drawingStarted = useRef(false)
  const cateOIRef = useRef<string | null>(null)
  cateOIRef.current = canvasCtx.cateOI
  const strokeWidth = 1.5
  const colorsRef = useRef(colors)

  // state
  // const [showCateEditBar, setShowCateEditBar] = useState(false)
  // const [showCateListBar, setShowCateListBar] = useState(false)
  // const [cateCandid, setCateCandid] = useState<string>('')
  // const [selBarFoldingState, setSelBarFoldingState] = useState(0)
  // const cycleSelBarFoldingState = () => {
  //   setSelBarFoldingState((selBarFoldingState + 1) % 4)
  // }

  // const abbr = (s: string, n: number) =>
  //   s.slice(0, n) + (s.length > n ? '...' : '')

  const newCategoryName = '_catX'
  colors[newCategoryName] = 'rgba(255,255,255,0.4)'

  const toImgCoords = (canvasCoords: any) => {
    return {
      ...canvasCoords,
      x: (canvasCoords.x + strokeWidth - xoffset.current) / scale.current,
      y: (canvasCoords.y + strokeWidth - yoffset.current) / scale.current,
      w: (canvasCoords.w - strokeWidth) / scale.current,
      h: (canvasCoords.h - strokeWidth) / scale.current
    }
  }

  const isTouchEvt = (
    e: React.TouchEvent | React.MouseEvent
  ): e is React.TouchEvent => {
    // safari and firefox has no TouchEvent
    return typeof TouchEvent !== 'undefined' && e instanceof TouchEvent
  }

  const isTouchScr =
    'ontouchstart' in window ||
    (navigator as any).maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0

  // interface groupedAnnotationsType {
  //   [key: string]: any
  // }

  // const groupedAnnotations: groupedAnnotationsType = imagesList[
  //   indexRef.current
  // ].annotations
  //   ? imgObj.annotations.reduce((ret: any, anno: any) => {
  //       ret[anno.category]
  //         ? ret[anno.category].push(anno)
  //         : (ret[anno.category] = [anno])
  //       return ret
  //     }, {})
  //   : {}

  // actions status
  const [can, setCan] = useState({
    undo: false,
    redo: false,
    reset: false,
    save: false
  })

  /**
   * Called after action to update action status
   */
  const updateActionStatus = () => {
    setCan({
      undo: ptrInStackRef.current > 1,
      redo: ptrInStackRef.current < stateStackRef.current.length,
      reset: stateStackRef.current.length > 1,
      save:
        ptrInStackRef.current > 1 ||
        ptrInStackRef.current < stateStackRef.current.length
    })
  }

  // const updateCategoryTo = (newCate: string) => {
  //   const canvas = canvasRef.current
  //   if (canvas) {
  //     const now = getLocalISOString()
  //     canvas.forEachObject((o: any) => {
  //       if (
  //         o.category === canvasCtx.cateOI &&
  //         (!canvasCtx.objectOI || o.unique_hash_z === canvasCtx.objectOI)
  //       ) {
  //         if (o.type === 'rect') o.set({ stroke: colors[newCate] })
  //         if (o.type === 'textbox') o.set({ backgroundColor: colors[newCate] })
  //         o.setOptions({ category: newCate, timestamp_z: now })
  //       }
  //     })

  //     cSave()

  //     if (canvasCtx.objectOI)
  //       setCanvasCtx({ cateOI: newCate, objectOI: canvasCtx.objectOI })
  //     else setCanvasCtx({ cateOI: newCate })
  //     syncCanvasStateToCanvasCtx()
  //     setShowCateEditBar(false)
  //   }
  // }

  // const aSave = () => {
  //   // if update to a new category, update projectContext to include
  //   // new category first, syncCanvasStateToCanvasCtx will repull the
  //   // project context, therefore project context should be updated
  //   // beforehand
  //   if (!categories.includes(cateCandid)) {
  //     categories = [...categories, cateCandid]

  //     // colors = {
  //     //   ...Object.fromEntries(
  //     //     categories.map((_: any, i: number) => [
  //     //       categories[i],
  //     //       cmap[i % cmap.length]
  //     //     ])
  //     //   )
  //     // }

  //     // setProject({ ...project, categories: categories, colors: colors })

  //     // as useQuery ["project", slug] will set projectContext, so its
  //     // refetch will reset projectContext, either disable
  //     // refetchOnWindowFocus in project_body, or setQueryData here

  //     // for fabric event listener (e.g. mouse:down) to use updated colors,
  //     // has to use ref and manual update the ref here
  //     colorsRef.current = colors
  //   }

  //   updateCategoryTo(cateCandid)
  // }

  // const aDelete = () => {
  //   updateCategoryTo(newCategoryName)
  // }

  // const syncCanvasStateToCanvasCtx = () => {
  //   // this function is responsible for updating sidebar after
  //   // actions like delete/redo/undo/add
  //   // it will trigger a rerender since imgObj prop will be changed
  //   // dependancy chain:
  //   // pagingData -> canvasCtx <-> imgObj -> groupedAnnotations -> sidebar

  //   const state = stateStackRef.current[ptrInStackRef.current - 1]

  //   // object in imgObj (or Context) may contain other props other than
  //   // the props listed in canvasStateType, so props should be merged
  //   const annotationsInCtx: { [key: string]: any } = {}

  //   imgObj.annotations.map((anno: any) => {
  //     annotationsInCtx[anno.unique_hash_z] = anno
  //   })

  //   // be careful xywh is CanvasCoords in state, but ImageCoords in imgObj
  //   const updatedAnnotations = state.map((anno: any) => {
  //     return { ...annotationsInCtx[anno.unique_hash_z], ...toImgCoords(anno) }
  //   })

  //   setCanvasCtx({
  //     imageOI: {
  //       ...imgObj,
  //       annotations: updatedAnnotations
  //     }
  //   })
  // }

  const syncCanvasStateToImgObj = () => {
    const state = stateStackRef.current[ptrInStackRef.current - 1]

    imgObj.annotations = state.map((anno: any) => {
      return anno.origin()
    })
  }

  /**
   * delete seleted annotation and its text
   */
  const cDelete = () => {
    const canvas = canvasRef.current

    if (canvas) {
      const selectedObj = canvas.getActiveObject()
      canvas.forEachObject((obj: any) => {
        if (obj.id === (selectedObj as any).id) canvas.remove(obj)
      })

      // delete an object doesn't fire object:modified event
      cSave()

      setCanvasCtx({ cateOI: null, objectOI: null })
      syncCanvasStateToImgObj()
    }
  }

  /**
   * undo all, rollback states
   */
  const cReset = () => {
    const canvas = canvasRef.current

    if (canvas) {
      const delay = canvasCtx.cateOI ? 100 : 0
      setCanvasCtx({ cateOI: null, objectOI: null })

      setTimeout(() => {
        canvas.remove(
          ...canvas.getObjects().filter((obj) => obj.type !== 'image')
        )

        ptrInStackRef.current =
          ptrInStackRef.current !== 1 ? 1 : stateStackRef.current.length

        drawObjectsFromState(
          stateStackRef.current[ptrInStackRef.current - 1],
          false
        )

        canvas.renderAll()

        updateActionStatus()
        syncCanvasStateToImgObj()
      }, delay)
    }
  }

  /**
   * undo one operation
   */
  const cUndo = () => {
    const canvas = canvasRef.current

    if (canvas) {
      // clear category selection information
      const delay = canvasCtx.cateOI ? 100 : 0
      setCanvasCtx({ cateOI: null, objectOI: null })

      setTimeout(() => {
        // remove all objects
        canvas.remove(
          ...canvas.getObjects().filter((obj) => obj.type !== 'image')
        )

        // draw objects of last state
        ptrInStackRef.current -= 1
        // don't use canvasCtxMasking, canvasCtx might not be synced at this moment
        // just show all objects without category filtering
        // it also makes more sense in undo/redo step
        drawObjectsFromState(
          stateStackRef.current[ptrInStackRef.current - 1],
          false
        )

        // drawObjectsFromState doesn't render
        canvas.renderAll()

        // update actions & sidebar
        updateActionStatus()
        syncCanvasStateToImgObj()
      }, delay)
    }
  }

  /**
   * redo one operation
   */
  const cRedo = () => {
    const canvas = canvasRef.current

    if (canvas) {
      const delay = canvasCtx.cateOI ? 100 : 0
      setCanvasCtx({ cateOI: null, objectOI: null })

      setTimeout(() => {
        canvas.remove(...canvas.getObjects().filter((o) => o.type !== 'image'))

        ptrInStackRef.current += 1

        drawObjectsFromState(
          stateStackRef.current[ptrInStackRef.current - 1],
          false
        )

        canvas.renderAll()

        updateActionStatus()
        syncCanvasStateToImgObj()
      }, delay)
    }
  }

  /**
   * save canvas states to state stack
   */
  const cSave = () => {
    const canvas = canvasRef.current

    if (canvas) {
      const state: any = []

      canvas.forEachObject((obj: any) => {
        if (obj.type === 'rect') {
          state.push(
            new RectLabel({
              x: obj.left,
              y: obj.top,
              w: obj.getScaledWidth() - obj.strokeWidth,
              h: obj.getScaledHeight() - obj.strokeWidth,
              id: obj.id,
              categoryName: obj.categoryName,
              scale: scale.current,
              offset: { x: xoffset.current, y: yoffset.current }
            })
          )
        }
      })

      if (ptrInStackRef.current < stateStackRef.current.length)
        stateStackRef.current = stateStackRef.current.slice(
          0,
          ptrInStackRef.current
        )
      stateStackRef.current.push(state)
      ptrInStackRef.current += 1

      updateActionStatus()
    }
  }

  const allSave = () => {
    const state = stateStackRef.current[ptrInStackRef.current - 1]
    const annotationsInCtx: { [key: string]: any } = {}
    imgObj.annotations.map((anno: any) => {
      annotationsInCtx[anno.unique_hash_z] = anno
    })
    const updatedAnnotations = state.map((anno: any) => {
      return { ...annotationsInCtx[anno.unique_hash_z], ...toImgCoords(anno) }
    })

    // canvasCtxDispatch({
    //   type: 'setImageOI',
    //   payload: { ...imgObj, annotations: updatedAnnotations }
    // })
    setCanvasCtx({
      imageOI: {
        ...imgObj,
        annotations: updatedAnnotations
      }
    })
    console.log('save called: need set hock for data save.')

    // const idxInPage = imgObj.idxInPage

    // queryClient.setQueryData(
    //   ['pagingData', pos, step],
    //   pagingData.map((imgData: any, idx: number) =>
    //     idx + 1 === idxInPage
    //       ? { ...imgData, annotations: updatedAnnotations }
    //       : imgData
    //   )
    // )

    // sync to backends and display success/failure notification
    // upsertDataAnnotationsMutation.mutate(updatedAnnotations)
  }

  /**
   * draw annotations
   * @param state state or annotations
   * @param canvasCtxMasking
   * @returns void
   */
  const drawObjectsFromState = (
    state: any,
    canvasCtxMasking: boolean = false
  ) => {
    const canvas = canvasRef.current
    if (!canvas) return

    state.forEach((anno: any) => {
      if (anno.type === 'Rect') {
        const { x, y, w, h, categoryName, id } = anno
        const visible =
          isAnnotationsVisible &&
          (!canvasCtxMasking ||
            canvasCtx.cateOI === null ||
            (canvasCtx.cateOI === categoryName &&
              (canvasCtx.objectOI === null || canvasCtx.objectOI === id)))
        const rect = new fabric.Rect({
          left: x,
          top: y,
          originX: 'left',
          originY: 'top',
          width: w,
          height: h,
          angle: 0,
          lockRotation: true,
          fill: 'rgba(255,0,0,0)',
          stroke: colors[categoryName],
          strokeWidth: strokeWidth,
          noScaleCache: false,
          strokeUniform: true,
          hasBorders: false,
          hasControls: true,
          hasRotatingPoint: false,
          cornerSize: 8,
          transparentCorners: false,
          perPixelTargetFind: true,
          visible: visible,
          selectable: !isTouchScr
        })

        rect.setOptions({ id, categoryName })
        rect.setControlsVisibility({ mtr: false })

        const textbox = new fabric.Textbox(id.toString(), {
          left: x + 1,
          top: y,
          originX: 'left',
          originY: 'top',
          fill: 'rgba(0,0,0,1)',
          backgroundColor: colors[categoryName],
          visible: visible,
          selectable: false,
          fontSize: Math.min(14, w / 2, h / 2),
          hoverCursor: 'default'
        })
        textbox.setOptions({ id, categoryName })

        canvas.add(rect, textbox)
      }
    })
  }

  const drawStartFromCursor = (o: fabric.IEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const pointer = canvas.getPointer(o.e)
    originX.current = pointer.x
    originY.current = pointer.y

    const state = stateStackRef.current[ptrInStackRef.current - 1]
    const id = state.length
    const categoryName = cateOIRef.current || newCategoryName

    const rect = new fabric.Rect({
      left: pointer.x - strokeWidth / 2,
      top: pointer.y - strokeWidth / 2,
      originX: 'left',
      originY: 'top',
      width: 0,
      height: 0,
      angle: 0,
      lockRotation: true,
      fill: 'rgba(255,0,0,0)',
      stroke: colorsRef.current[categoryName],
      strokeWidth: strokeWidth,
      noScaleCache: false,
      strokeUniform: true,
      hasBorders: false,
      hasControls: true,
      hasRotatingPoint: false,
      cornerSize: 8,
      transparentCorners: false,
      perPixelTargetFind: true,
      visible: true,
      selectable: !isTouchScr
    })
    rect.setOptions({
      id,
      categoryName
      // unique_hash_z: unique_hash_z,
      // category: cate,
      // text_id: text_id,
      // timestamp_z: now
    })
    rect.setControlsVisibility({ mtr: false })
    canvas.add(rect)
    onDrawObj.current = rect

    const textbox = new fabric.Textbox(id.toString(), {
      left: pointer.x - strokeWidth / 2 + 1,
      top: pointer.y - strokeWidth / 2,
      originX: 'left',
      originY: 'top',
      fill: 'rgba(0,0,0,1)',
      backgroundColor: colorsRef.current[categoryName],
      visible: true,
      selectable: false,
      fontSize: 0,
      hoverCursor: 'default'
    })
    textbox.setOptions({
      id,
      categoryName
      // unique_hash_z: unique_hash_z,
      // category: cate
    })
    canvas.add(textbox)
    drawingStarted.current = true
  }

  const drawEndAtCursor = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // remove w=0 h=0 onDraw box that generated by just a click
    // or box totally outside of image area
    const obj = onDrawObj.current as fabric.Object
    const invalid =
      (obj.width as number) <= strokeWidth ||
      (obj.height as number) <= strokeWidth
    if (invalid) {
      canvas.remove(obj)
      // remove its textBox
      canvas.forEachObject((t: any) => {
        if (t.unique_hash_z === (obj as any).unique_hash_z) canvas.remove(t)
      })
    }

    if (!invalid) {
      // save state
      cSave()
      syncCanvasStateToImgObj()

      setCanvasCtx({
        cateOI: (obj as any).category,
        objectOI: (obj as any).unique_hash_z
      })

      // 1. has to be put after syncCanvasStateToCanvasCtx cuz it will deselect all & rerender
      // 2. cuz canvasCtxDispatch triggers rerender asyncly, the onDrawObj has to be set active
      //    manually here so downstream code and pick it up immediately and adjust the textBox size
      canvas.setActiveObject(obj)
    }

    // unset isDrawing has to be put after setObjectOI, otherwise it will
    // show all boxes and then select onDrawObj
    setCanvasCtx({ isDrawing: false })
    drawingStarted.current = false
  }

  /**
   * Called when imgObj or window changed
   */
  const onImgLoad = () => {
    // initialize and calculate the variables
    const img: any = imgElRef.current
    const { width: cw, height: ch } = img.getBoundingClientRect()

    const divCanvasExtended = document.getElementById('canvas_extended')
    const cew = (divCanvasExtended as HTMLElement).getBoundingClientRect().width
    const ceh =
      (divCanvasExtended as HTMLElement).getBoundingClientRect().height - 36

    const e_offset_x = (cew - cw) / 2
    const e_offset_y = (ceh - ch) / 2

    // initialize stacks
    stateStackRef.current = []
    ptrInStackRef.current = 0

    // initialize xoffset & scale
    xoffset.current = (cew - cw) / 2
    yoffset.current = (ceh - ch) / 2

    scale.current = (cw / imgObj.imageWidth + ch / imgObj.imageHeight) / 2

    if (canvasRef.current === null) {
      // clear category selection information when clicking an image from workspace landing page
      setCanvasCtx({ cateOI: null, objectOI: null })

      canvasRef.current = new fabric.Canvas(canvasElRef.current, {
        defaultCursor: 'default',
        selection: false,
        targetFindTolerance: 5,
        uniformScaling: false
      })

      const canvas = canvasRef.current
      canvas.setWidth(cew)
      canvas.setHeight(ceh)

      const lowerCanvasEl = canvas.getElement()

      const canvasContainerEl = lowerCanvasEl.parentElement as HTMLElement
      canvasContainerEl.style.position = 'absolute'
      canvasContainerEl.style.top = '0'
      canvasContainerEl.classList.add('bg-gray-200')
      canvasContainerEl.style.touchAction = 'none'

      lowerCanvasEl.classList.remove('hidden')
      const upperCanvasEl = lowerCanvasEl.nextElementSibling as Element
      upperCanvasEl.classList.remove('hidden')
    }

    // clear box selection information from last image, but keep category selection information & reset isDrawing mode
    setCanvasCtx({ objectOI: null, isDrawing: false })

    // close CateEditBar
    // setShowCateEditBar(false)

    const canvas = canvasRef.current
    canvas.clear()
    canvas.setWidth(cew)
    canvas.setHeight(ceh)
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0])

    canvas.add(
      new fabric.Image(img, {
        left: xoffset.current,
        top: yoffset.current,
        scaleX: scale.current,
        scaleY: scale.current,
        hasBorders: false,
        hasControls: false,
        selectable: false,
        hoverCursor: 'default'
      })
    )

    if (imgObj.annotations !== null) {
      // keep context as category filtering during image opening/switching
      // so we can quickly browse one specific category objects on all images
      drawObjectsFromState(
        imgObj.annotations.map((anno) =>
          anno.scaleTransform(scale.current, xoffset.current, yoffset.current)
        ),
        true
      )
    }

    canvas.renderAll()
    canvas.zoomToPoint(new fabric.Point(cew / 2, ceh / 2), 1) // TODO: use math to calculate the rate to make the images biggest

    cSave()

    // remove old eventHandler
    canvas.off('mouse:wheel')
    // update eventHandler
    canvas.on('mouse:wheel', (o) => {
      const evt = o.e as any as React.WheelEvent
      const delta = evt.deltaY
      let zoom = canvas.getZoom()
      zoom *= 0.999 ** delta
      if (zoom > 20) zoom = 20
      if (zoom < 0.01) zoom = 0.01
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
        if (vpt[4] >= 0) {
          vpt[4] = 0
        } else if (vpt[4] < cew * (1 - zoom)) {
          vpt[4] = cew * (1 - zoom)
        }
        if (vpt[5] >= 0) {
          vpt[5] = 0
        } else if (vpt[5] < ceh * (1 - zoom)) {
          vpt[5] = ceh * (1 - zoom)
        }
      }
    })

    canvas.off('mouse:down')
    canvas.on('mouse:down', (o) => {
      if (isDrawingRef.current) {
        drawStartFromCursor(o)
      } else {
        const evt = o.e as any as React.MouseEvent | React.TouchEvent

        let clientX // screen/page coordinates
        let clientY // screen/page coordinates

        if (isTouchEvt(evt)) {
          clientX = evt.touches[0].clientX
          clientY = evt.touches[0].clientY
        } else {
          clientX = evt.clientX
          clientY = evt.clientY
        }

        const selectedObj = canvas.getActiveObject()

        lastPosX.current = clientX
        lastPosY.current = clientY

        isPanning.current = !selectedObj

        if (selectedObj)
          setCanvasCtx({
            cateOI: (selectedObj as any).categoryName,
            objectOI: (selectedObj as any).id
          })
        else setCanvasCtx({ cateOI: null, objectOI: null })
      }
    })

    canvas.off('mouse:move')
    canvas.on('mouse:move', (o) => {
      if (isDrawingRef.current && drawingStarted.current) {
        const pointer = canvas.getPointer(o.e)

        const obj = onDrawObj.current as fabric.Object
        const origX = originX.current
        const origY = originY.current

        const left =
          Math.min(
            Math.max(e_offset_x, origX > pointer.x ? pointer.x : origX),
            e_offset_x + cw
          ) - strokeWidth
        const right = Math.max(
          Math.min(e_offset_x + cw, origX > pointer.x ? origX : pointer.x),
          e_offset_x
        )
        const top =
          Math.min(
            Math.max(e_offset_y, origY > pointer.y ? pointer.y : origY),
            e_offset_y + ch
          ) - strokeWidth
        const bottom = Math.max(
          Math.min(e_offset_y + ch, origY > pointer.y ? origY : pointer.y),
          e_offset_y
        )

        obj.set({
          left: left,
          top: top,
          width: right - left,
          height: bottom - top
        })

        canvas.requestRenderAll()
      }

      if (isPanning.current) {
        const evt = o.e as any as React.MouseEvent | React.TouchEvent

        let clientX
        let clientY

        if (isTouchEvt(evt)) {
          clientX = evt.touches[0].clientX
          clientY = evt.touches[0].clientY
        } else {
          clientX = evt.clientX
          clientY = evt.clientY
        }

        const zoom = canvas.getZoom()
        const vpt = canvas.viewportTransform as number[]
        if (zoom < 1) {
          vpt[4] = (cew * (1 - zoom)) / 2
          vpt[5] = (ceh * (1 - zoom)) / 2
        } else {
          vpt[4] += clientX - lastPosX.current
          vpt[5] += clientY - lastPosY.current
          if (vpt[4] >= 0) {
            vpt[4] = 0
          } else if (vpt[4] < cew * (1 - zoom)) {
            vpt[4] = cew * (1 - zoom)
          }
          if (vpt[5] >= 0) {
            vpt[5] = 0
          } else if (vpt[5] < ceh * (1 - zoom)) {
            vpt[5] = ceh * (1 - zoom)
          }
        }

        canvas.requestRenderAll()
        lastPosX.current = clientX
        lastPosY.current = clientY
      }
    })

    canvas.off('mouse:up')
    canvas.on('mouse:up', () => {
      if (isDrawingRef.current) {
        drawEndAtCursor()
      }

      // on mouse up we want to recalculate new interaction
      // for all objects, so we call setViewportTransform
      canvas.setViewportTransform(canvas.viewportTransform as number[])
      isPanning.current = false

      // update corresponding textBox position
      const selObj: any = canvas.getActiveObject()
      if (selObj) {
        const theTextBox = canvas._objects.filter((o: any) => {
          return (
            o.type === 'textbox' && o.unique_hash_z === selObj.unique_hash_z
          )
        })[0] as fabric.Textbox

        // selected object width/height dont get updated automatically
        const w = selObj.getScaledWidth() - selObj.strokeWidth
        const h = selObj.getScaledHeight() - selObj.strokeWidth

        const fs = Math.min(14, w / 2, h / 2)
        const ndigits = (theTextBox.text as string).length
        theTextBox.set({
          top: selObj.top,
          left: selObj.left + 1,
          fontSize: fs,
          width: (fs * ndigits) / 2
        })
      }
    })

    canvas.off('object:modified')
    canvas.on('object:modified', () => {
      cSave()
    })

    // use-gestures for touch events
    // const lowerCanvasEl = canvas.getElement()
    // const canvasContainerEl = lowerCanvasEl.parentElement as HTMLElement

    // if (pinchGesture.current !== null) pinchGesture.current.destroy()
    // pinchGesture.current = new PinchGesture(
    //   canvasContainerEl,
    //   ({ offset: [scale] }) => {
    //     canvas.zoomToPoint(new fabric.Point(cew / 2, ceh / 2), scale)

    //     const vpt: any = canvas.viewportTransform
    //     if (scale < 1) {
    //       vpt[4] = (cew * (1 - scale)) / 2
    //       vpt[5] = (ceh * (1 - scale)) / 2
    //     } else {
    //       if (vpt[4] >= 0) {
    //         vpt[4] = 0
    //       } else if (vpt[4] < cew * (1 - scale)) {
    //         vpt[4] = cew * (1 - scale)
    //       }
    //       if (vpt[5] >= 0) {
    //         vpt[5] = 0
    //       } else if (vpt[5] < ceh * (1 - scale)) {
    //         vpt[5] = ceh * (1 - scale)
    //       }
    //     }
    //   },
    //   {
    //     scaleBounds: { min: 0.5, max: 10.0 }
    //   }
    // )

    window.onresize = onImgLoad
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.discardActiveObject()
      canvas.forEachObject((o: any) => {
        if (o.type !== 'image')
          o.visible =
            isAnnotationsVisible &&
            !canvasCtx.isDrawing &&
            (canvasCtx.cateOI === null ||
              (canvasCtx.cateOI === o.category &&
                (canvasCtx.objectOI === null ||
                  (o.type === 'rect' && canvasCtx.objectOI === o.id) ||
                  false)))

        if (o.type === 'rect' && canvasCtx.objectOI === o.id)
          canvas.setActiveObject(o)
      })
      canvas.renderAll()
    }
  }, [
    isAnnotationsVisible,
    canvasCtx.cateOI,
    canvasCtx.objectOI,
    canvasCtx.isDrawing
  ])

  const showPrev = (evt: React.MouseEvent) => {
    evt.preventDefault()
    evt.stopPropagation()

    if (indexRef.current) {
      indexRef.current -= 1
      allSave()
      setImgObj(imagesList[indexRef.current])
      setCanvasCtx({ imageOI: imgObj })
      if (onPrevious) onPrevious(canvasCtx)
    }
  }

  const showNext = (evt: React.MouseEvent) => {
    evt.preventDefault()
    evt.stopPropagation()

    if (indexRef.current < imagesList.length - 1) {
      indexRef.current += 1
      allSave()
      setImgObj(imagesList[indexRef.current])
      setCanvasCtx({ imageOI: imgObj })
      if (onNext) onNext(canvasCtx)
    }
  }

  return (
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
          {/* <Draggable
            bounds='parent'
            handle='#cate_handle'
            cancel='.selbar-state-icon'
          >
            <div className='bg-gray-100 bg-opacity-0 absolute top-2 right-2 visible rounded-md max-h-full w-24 flex flex-col items-end text-xs shadow-lg select-none'>
              <div
                id='cate_handle'
                className='bg-indigo-400 py-2 px-2 w-full rounded-t-md flex justify-between'
              >
                {selBarFoldingState % 4 === 0 ? (
                  <MenuIcon
                    className='h-4 w-4 text-gray-700 selbar-state-icon'
                    onClick={cycleSelBarFoldingState}
                  />
                ) : selBarFoldingState % 4 === 1 ? (
                  <MenuAlt2Icon
                    className='h-4 w-4 text-gray-700 selbar-state-icon'
                    onClick={cycleSelBarFoldingState}
                  />
                ) : selBarFoldingState % 4 === 2 ? (
                  <MenuAlt3Icon
                    className='h-4 w-4 text-gray-700 selbar-state-icon'
                    onClick={cycleSelBarFoldingState}
                  />
                ) : (
                  <MenuAlt4Icon
                    className='h-4 w-4 text-gray-700 selbar-state-icon'
                    onClick={cycleSelBarFoldingState}
                  />
                )}
                category
              </div>
              <div
                className={`h-full w-full overflow-y-auto ${
                  selBarFoldingState === 3 ? 'hidden' : ''
                }`}
              >
                {Object.entries(groupedAnnotations).map(
                  ([cate, group], i_group) => (
                    <div
                      className={`px-2 flex flex-col items-end w-full py-1 rounded-lg ${
                        canvasCtx.cateOI === cate
                          ? 'border-l-6 border-indigo-600'
                          : ''
                      }`}
                      style={{ backgroundColor: colors[cate] }}
                      key={`group-${i_group}`}
                      onClick={() => {
                        setCanvasCtx({ cateOI: cate, objectOI: null })
                      }}
                    >
                      <div
                        className={`pb-1 static w-full flex justify-end ${
                          selBarFoldingState === 2 && canvasCtx.cateOI !== cate
                            ? 'hidden'
                            : ''
                        }`}
                      >
                        <div
                          className={`absolute left-0 transform -translate-x-6 md:-translate-x-8 ${
                            canvasCtx.isDrawing || canvasCtx.cateOI !== cate
                              ? 'invisible'
                              : 'visible'
                          }`}
                          onClick={(evt) => {
                            evt.preventDefault()
                            evt.stopPropagation()
                            if (canvasCtx.isDrawing) return
                            setCateCandid(canvasCtx.cateOI as unknown as string)
                            setShowCateEditBar(true)
                          }}
                        >
                          <CogIcon
                            className={`w-6 h-6 md:w-8 md:h-8 ${
                              showCateEditBar
                                ? 'text-indigo-600'
                                : 'text-gray-700'
                            } `}
                          />
                        </div>
                        <span>{abbr(cate, 7)}</span>
                      </div>
                      <div
                        className={`flex flex-row-reverse w-20 flex-wrap ${
                          selBarFoldingState === 1 && canvasCtx.cateOI !== cate
                            ? 'hidden'
                            : ''
                        } `}
                      >
                        {group.map((anno: any, i_item: number) => (
                          <div
                            key={`item-${i_item}`}
                            className={`h-5 w-5 ${
                              (i_item + 1) % 3 === 0 ? '' : 'ml-1'
                            } ${
                              i_item < 3 ? '' : 'mt-1'
                            } rounded-md flex justify-center items-center ${
                              canvasCtx.objectOI === anno.unique_hash_z
                                ? 'bg-indigo-600 text-gray-100'
                                : 'bg-gray-200'
                            } ${
                              // isTouchScr
                              //   ? ''
                              //   : 'hover:bg-indigo-600 hover:text-gray-100'
                              ''
                            }`}
                            onClick={(evt) => {
                              if (canvasCtx.isDrawing) return
                              evt.preventDefault()
                              evt.stopPropagation()
                              setCanvasCtx({
                                cateOI: anno.category,
                                objectOI: anno.unique_hash_z
                              })
                            }}
                          >
                            <span>{anno.text_id}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </Draggable> */}

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
                  !imgObj // TODO
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
                  !imgObj // TODO
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
              canvasCtx.objectOI !== null
                ? 'hover:bg-indigo-600 hover:text-gray-100'
                : 'text-gray-400'
            }`}
            onClick={canvasCtx.objectOI !== null ? cDelete : undefined}
          >
            <TrashIcon className='h-4 w-4' />
          </div>
          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              canvasCtx.isDrawing ? 'bg-indigo-600 text-gray-100' : ''
            }`}
            onClick={() => {
              setCanvasCtx({ objectOI: null, isDrawing: true })
            }}
          >
            <PencilIcon className='h-4 w-4' />
          </div>
        </div>

        <div className='flex justify-center space-x-1'>
          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              can.undo
                ? 'hover:bg-indigo-600 hover:text-gray-100'
                : 'text-gray-400'
            }`}
            onClick={can.undo ? cUndo : undefined}
          >
            <ReplyIcon className='h-4 w-4' />
          </div>
          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              can.redo
                ? 'hover:bg-indigo-600 hover:text-gray-100'
                : 'text-gray-400'
            }
          `}
            onClick={can.redo ? cRedo : undefined}
          >
            <ReplyIcon className='h-4 w-4 transform -scale-x-1' />
          </div>
        </div>

        <div className='flex justify-center space-x-1'>
          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              can.reset
                ? 'hover:bg-indigo-600 hover:text-gray-100'
                : 'text-gray-400'
            }`}
            onClick={can.reset ? cReset : undefined}
          >
            <RefreshIcon className='h-4 w-4' />
          </div>
          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              can.save
                ? 'hover:bg-indigo-600 hover:text-gray-100'
                : 'text-gray-400'
            }`}
            onClick={can.save ? allSave : undefined}
          >
            <HeavyFloppyIcon />
          </div>
        </div>
      </div>

      <div className='flex justify-center space-x-1 absolute bottom-0 left-1 md:left-1/4'>
        <div
          onClick={() => {
            setCanvasCtx({ imageOI: null })
            if (onClose) onClose(canvasCtx)
          }}
          className='h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer hover:bg-indigo-600 hover:text-gray-100'
        >
          <XIcon className='h-4 w-4' />
        </div>
      </div>
    </div>
  )
}
