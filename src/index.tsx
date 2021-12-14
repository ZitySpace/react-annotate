/* eslint-disable camelcase */
import * as React from 'react'
import { fabric } from 'fabric'
import Draggable from 'react-draggable'
// import { PinchGesture } from '@use-gesture/vanilla'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XIcon,
  MenuAlt2Icon,
  MenuAlt3Icon,
  MenuAlt4Icon,
  MenuIcon,
  TrashIcon,
  ReplyIcon,
  CheckIcon,
  RefreshIcon,
  PencilIcon,
  CogIcon,
  TagIcon,
  HandIcon
} from '@heroicons/react/solid'
import { useRef, useState } from 'react'
import { HeavyFloppyIcon } from './components/icons'

// TODO: mock data remove
import { canvasCtxMock, projectMock } from './mockdata'
import { ImageObject } from './interface'

type canvasStateType = {
  x: number
  y: number
  w: number
  h: number
  category: string
  unique_hash_z: string
  text_id: string
  timestamp_z: string
}[]

// enum CoordsType {
//   CANVAS = 'CANVAS',
//   IMG = 'IMG'
// }

export const ImageAnnotater = ({ imageObj }: { imageObj: any }) => {
  console.log(imageObj)
  const imgObj: ImageObject = {
    fileName: imageObj.file_name,
    fileSize: imageObj.file_size,
    imageWidth: imageObj.image_width,
    imageHeight: imageObj.image_height,
    annotations: imageObj.annotations,
    blobUrl: imageObj.blobSrc
  }
  console.log(imgObj)

  // ref
  const imgElRef = useRef(null)
  const canvasElRef = useRef(null)
  const canvasRef = useRef<fabric.Canvas | null>(null)
  const stateStackRef = useRef<canvasStateType[]>([])
  const ptrInStackRef = useRef(0)

  const xoffset = useRef<number>(0)
  const yoffset = useRef<number>(0)
  const xscale = useRef<number>(1)
  const yscale = useRef<number>(1)

  // for zoom/pan/drag
  // const isPanning = useRef(false)
  // const lastPosX = useRef(0)
  // const lastPosY = useRef(0)
  // const pinchGesture = useRef<PinchGesture | null>(null)

  // context
  const [canvasCtx] = useState(canvasCtxMock)
  const isDrawingRef = useRef(false)
  isDrawingRef.current = canvasCtx.isDrawing

  // state
  const [showCateEditBar, setShowCateEditBar] = useState(false)
  const [showCateListBar, setShowCateListBar] = useState(false)
  const [cateCandid, setCateCandid] = useState<string>('')
  const [selBarFoldingState, setSelBarFoldingState] = useState(0)
  const cycleSelBarFoldingState = () => {
    setSelBarFoldingState((selBarFoldingState + 1) % 4)
  }

  const [canUndo] = useState(false)
  const [canRedo] = useState(false)
  const [canReset] = useState(false)

  const abbr = (s: string, n: number) =>
    s.slice(0, n) + (s.length > n ? '...' : '')

  const { categories, colors } = projectMock

  const newCategoryName = '_catX'
  colors[newCategoryName] = 'rgba(255,255,255,0.4)'

  interface groupedAnnotationsType {
    [key: string]: any
  }
  const groupedAnnotations: groupedAnnotationsType = imgObj.annotations
    ? imgObj.annotations.reduce((ret: any, anno: any) => {
        ret[anno.category]
          ? ret[anno.category].push(anno)
          : (ret[anno.category] = [anno])
        return ret
      }, {})
    : {}

  const onImgLoad = () => {
    const img: any = imgElRef.current

    const cw = img.getBoundingClientRect().width
    const ch = img.getBoundingClientRect().height

    const divCanvasExtended = document.getElementById('canvas_extended')
    const cew = (divCanvasExtended as HTMLElement).getBoundingClientRect().width

    const ceh =
      (divCanvasExtended as HTMLElement).getBoundingClientRect().height - 36

    console.log(cw, ch, cew, ceh)

    const e_offset_x = (cew - cw) / 2
    const e_offset_y = (ceh - ch) / 2

    // initialize stacks
    stateStackRef.current = []
    ptrInStackRef.current = 0

    // initialize xoffset & scale
    xoffset.current = e_offset_x
    yoffset.current = e_offset_y
    xscale.current = cw / imgObj.imageWidth
    yscale.current = ch / imgObj.imageHeight

    if (canvasRef.current === null) {
      // clear category selection information when clicking an image from workspace landing page
      // canvasCtxDispatch({
      //   type: 'setCateOI',
      //   payload: null
      // })

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

    // clear box selection information from last image, but keep category selection information
    // canvasCtxDispatch({
    //   type: 'clearObjectOI'
    // })

    // reset isDrawing mode
    // canvasCtxDispatch({
    //   type: 'setIsDrawing',
    //   payload: false
    // })

    // close CateEditBar
    setShowCateEditBar(false)

    const canvas = canvasRef.current
    canvas.clear()
    canvas.setWidth(cew)
    canvas.setHeight(ceh)
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0])

    canvas.add(
      new fabric.Image(img, {
        left: e_offset_x,
        top: e_offset_y,
        scaleX: cw / imgObj.imageWidth,
        scaleY: ch / imgObj.imageHeight,
        hasBorders: false,
        hasControls: false,
        selectable: false,
        hoverCursor: 'default'
      })
    )

    if (imgObj.annotations !== null) {
      // keep context as category filtering during image opening/switching
      // so we can quickly browse one specific category objects on all images
      // drawObjectsFromState(imgObj.annotations, CoordsType.IMG, true)
    }

    canvas.renderAll()
    canvas.zoomToPoint(new fabric.Point(cew / 2, ceh / 2), 1)
    // cSave()

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
    // canvas.on('mouse:down', (o) => {
    //   if (isDrawingRef.current) {
    //     drawStartFromCursor(o)
    //   } else {
    //     const evt = o.e as any as React.MouseEvent | React.TouchEvent

    //     let clientX // screen/page coordinates
    //     let clientY // screen/page coordinates

    //     if (isTouchEvt(evt)) {
    //       clientX = evt.touches[0].clientX
    //       clientY = evt.touches[0].clientY
    //     } else {
    //       clientX = evt.clientX
    //       clientY = evt.clientY
    //     }

    //     const selObj = canvas.getActiveObject()

    //     lastPosX.current = clientX
    //     lastPosY.current = clientY

    //     isPanning.current = selObj === null || selObj === undefined

    //     if (selObj)
    //       canvasCtxDispatch({
    //         type: 'setObjectOI',
    //         payload: {
    //           category: (selObj as any).category,
    //           unique_hash_z: (selObj as any).unique_hash_z
    //         }
    //       })
    //     else
    //       canvasCtxDispatch({
    //         type: 'setCateOI',
    //         payload: null
    //       })
    //   }
    // })

    canvas.off('mouse:move')
    // canvas.on('mouse:move', (o) => {
    //   if (isDrawingRef.current && drawingStarted.current) {
    //     const pointer = canvas.getPointer(o.e)

    //     const obj = onDrawObj.current as fabric.Object
    //     const origX = originX.current
    //     const origY = originY.current

    //     const left =
    //       Math.min(
    //         Math.max(e_offset_x, origX > pointer.x ? pointer.x : origX),
    //         e_offset_x + cw
    //       ) - strokeWidth
    //     const right = Math.max(
    //       Math.min(e_offset_x + cw, origX > pointer.x ? origX : pointer.x),
    //       e_offset_x
    //     )
    //     const top =
    //       Math.min(
    //         Math.max(e_offset_y, origY > pointer.y ? pointer.y : origY),
    //         e_offset_y + ch
    //       ) - strokeWidth
    //     const bottom = Math.max(
    //       Math.min(e_offset_y + ch, origY > pointer.y ? origY : pointer.y),
    //       e_offset_y
    //     )

    //     obj.set({
    //       left: left,
    //       top: top,
    //       width: right - left,
    //       height: bottom - top
    //     })

    //     canvas.requestRenderAll()
    //   }

    //   if (isPanning.current) {
    //     const evt = o.e as any as React.MouseEvent | React.TouchEvent

    //     let clientX
    //     let clientY

    //     if (isTouchEvt(evt)) {
    //       clientX = evt.touches[0].clientX
    //       clientY = evt.touches[0].clientY
    //     } else {
    //       clientX = evt.clientX
    //       clientY = evt.clientY
    //     }

    //     const zoom = canvas.getZoom()
    //     const vpt = canvas.viewportTransform as number[]
    //     if (zoom < 1) {
    //       vpt[4] = (cew * (1 - zoom)) / 2
    //       vpt[5] = (ceh * (1 - zoom)) / 2
    //     } else {
    //       vpt[4] += clientX - lastPosX.current
    //       vpt[5] += clientY - lastPosY.current
    //       if (vpt[4] >= 0) {
    //         vpt[4] = 0
    //       } else if (vpt[4] < cew * (1 - zoom)) {
    //         vpt[4] = cew * (1 - zoom)
    //       }
    //       if (vpt[5] >= 0) {
    //         vpt[5] = 0
    //       } else if (vpt[5] < ceh * (1 - zoom)) {
    //         vpt[5] = ceh * (1 - zoom)
    //       }
    //     }

    //     canvas.requestRenderAll()
    //     lastPosX.current = clientX
    //     lastPosY.current = clientY
    //   }
    // })

    canvas.off('mouse:up')
    // canvas.on('mouse:up', () => {
    //   if (isDrawingRef.current) {
    //     drawEndAtCursor()
    //   }

    //   // on mouse up we want to recalculate new interaction
    //   // for all objects, so we call setViewportTransform
    //   canvas.setViewportTransform(canvas.viewportTransform as number[])
    //   isPanning.current = false

    //   // update corresponding textBox position
    //   const selObj: any = canvas.getActiveObject()
    //   if (selObj) {
    //     const theTextBox = canvas._objects.filter((o: any) => {
    //       return (
    //         o.type === 'textbox' && o.unique_hash_z === selObj.unique_hash_z
    //       )
    //     })[0] as fabric.Textbox

    //     // selected object width/height dont get updated automatically
    //     const w = selObj.getScaledWidth() - selObj.strokeWidth
    //     const h = selObj.getScaledHeight() - selObj.strokeWidth

    //     const fs = Math.min(14, w / 2, h / 2)
    //     const ndigits = (theTextBox.text as string).length
    //     theTextBox.set({
    //       top: selObj.top,
    //       left: selObj.left + 1,
    //       fontSize: fs,
    //       width: (fs * ndigits) / 2
    //     })
    //   }
    // })

    canvas.off('object:modified')
    // canvas.on('object:modified', () => {
    //   cSave()
    // })

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
            canvasCtx.annotationsVisible ? '' : 'hidden'
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
                      // onClick={() => {
                      //   canvasCtxDispatch({
                      //     type: 'setCateOI',
                      //     payload: cate
                      //   })
                      // }}
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
                          // onClick={(evt) => {
                          //   evt.preventDefault()
                          //   evt.stopPropagation()
                          //   if (canvasCtx.isDrawing) return
                          //   setCateCandid(canvasCtx.cateOI as string)
                          //   setShowCateEditBar(true)
                          // }}
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
                            // onClick={(evt) => {
                            //   if (canvasCtx.isDrawing) return
                            //   evt.preventDefault()
                            //   evt.stopPropagation()
                            //   canvasCtxDispatch({
                            //     type: 'setObjectOI',
                            //     payload: {
                            //       category: anno.category,
                            //       unique_hash_z: anno.unique_hash_z
                            //     }
                            //   })
                            // }}
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
          </Draggable>

          <Draggable bounds='parent' handle='#cate_edit_handle'>
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
                    // onClick={
                    //   canvasCtx.cateOI === cateCandid ? undefined : aSave
                    // }
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
                    // onClick={() => {
                    //   if (canvasCtx.cateOI !== cateCandid)
                    //     setCateCandid(canvasCtx.cateOI as string)
                    //   else if (cateCandid !== newCategoryName) aDelete()
                    // }}
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
          </Draggable>
        </div>
      </div>

      <div className='flex justify-center space-x-1 absolute bottom-0 right-1 md:right-1/4'>
        <div
          // onClick={showPrev}
          className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer
                ${
                  // imgObj.idxInPage === 1
                  //   ? 'text-gray-400'
                  //   : 'hover:bg-indigo-600 hover:text-gray-100'
                  ''
                }`}
        >
          <ChevronLeftIcon className='h-4 w-4' />
        </div>

        <div
          // onClick={showNext}
          className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer
                ${
                  // imgObj.idxInPage === pagingData.length
                  //   ? 'text-gray-400'
                  //   : 'hover:bg-indigo-600 hover:text-gray-100'
                  ''
                }`}
        >
          <ChevronRightIcon className='h-4 w-4' />
        </div>
      </div>

      <div
        className={`flex justify-center space-x-2 absolute bottom-0 ${
          canvasCtx.annotationsVisible ? '' : 'hidden'
        }`}
      >
        <div className='flex justify-center space-x-1'>
          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              canvasCtx.objectOI
                ? 'hover:bg-indigo-600 hover:text-gray-100'
                : 'text-gray-400'
            }`}
            // onClick={canvasCtx.objectOI ? cDelete : undefined}
          >
            <TrashIcon className='h-4 w-4' />
          </div>
          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              canvasCtx.isDrawing ? 'bg-indigo-600 text-gray-100' : ''
            }`}
            // onClick={() => {
            //   canvasCtxDispatch({
            //     type: 'clearObjectOI'
            //   })
            //   canvasCtxDispatch({
            //     type: 'setIsDrawing',
            //     payload: true
            //   })
            // }}
          >
            <PencilIcon className='h-4 w-4' />
          </div>
        </div>

        <div className='flex justify-center space-x-1'>
          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              canUndo
                ? 'hover:bg-indigo-600 hover:text-gray-100'
                : 'text-gray-400'
            }`}
            // onClick={canUndo ? cUndo : undefined}
          >
            <ReplyIcon className='h-4 w-4' />
          </div>
          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              canRedo
                ? 'hover:bg-indigo-600 hover:text-gray-100'
                : 'text-gray-400'
            }
          `}
            // onClick={canRedo ? cRedo : undefined}
          >
            <ReplyIcon className='h-4 w-4 transform -scale-x-1' />
          </div>
        </div>

        <div className='flex justify-center space-x-1'>
          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              canReset
                ? 'hover:bg-indigo-600 hover:text-gray-100'
                : 'text-gray-400'
            }`}
            // onClick={canReset ? cReset : undefined}
          >
            <RefreshIcon className='h-4 w-4' />
          </div>
          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              // canSave
              //   ? 'hover:bg-indigo-600 hover:text-gray-100'
              //   : 'text-gray-400'
              ''
            }`}
            // onClick={canSave ? allSave : undefined}
          >
            <HeavyFloppyIcon />
          </div>
        </div>
      </div>

      <div className='flex justify-center space-x-1 absolute bottom-0 left-1 md:left-1/4'>
        <div
          // onClick={() => {
          //   canvasCtxDispatch({
          //     type: 'setImageOI',
          //     payload: null
          //   })
          // }}
          className='h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer hover:bg-indigo-600 hover:text-gray-100'
        >
          <XIcon className='h-4 w-4' />
        </div>
      </div>
    </div>
  )
}
