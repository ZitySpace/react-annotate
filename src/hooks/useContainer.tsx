import { fabric } from 'fabric';
import React, { useEffect, useRef } from 'react';
import { Dimension } from '../classes/Geometry/Dimension';
import { CANVAS_CONFIG } from '../interfaces/config';

import {
  CanvasMetaStore,
  CanvasMetaStoreProps,
} from '../stores/CanvasMetaStore';
import { useStore } from 'zustand';

export interface UseContainerReturnProps {
  Container: JSX.Element; // canvas dom
  canvas: fabric.Canvas | null;
  canvasDims: Dimension | null;
}

export const useContainer = () => {
  const canvasElm = useRef<HTMLCanvasElement | null>(null);

  const {
    canvas,
    initDims: canvasInitDims,
    setCanvas,
    setInitDims: setCanvasInitDims,
  } = useStore(CanvasMetaStore, (s: CanvasMetaStoreProps) => s);

  const calcCanvasDims = () => {
    const extendElm = document.getElementById('canvas_extended') as HTMLElement;
    const { width: canvas_w, height: _canvas_h } =
      extendElm.getBoundingClientRect(); // get canvas extend element dimensions
    const canvas_h = _canvas_h - 36; // minus the buttons bar's height
    const _canvasDims = new Dimension(canvas_w, canvas_h);
    return _canvasDims;
  };

  const initCanvas = () => {
    const canvas = new fabric.Canvas(canvasElm.current, CANVAS_CONFIG);

    const { w: canvas_w, h: canvas_h } = calcCanvasDims();
    canvas.setWidth(canvas_w);
    canvas.setHeight(canvas_h);

    // set canvas element and its extend element styles
    const lowerCanvasElm = canvas.getElement();
    const upperCanvasElm = lowerCanvasElm.nextElementSibling as Element;
    const extendElm = lowerCanvasElm.parentElement as HTMLElement;
    extendElm.style.position = 'absolute';
    extendElm.style.top = '0';
    extendElm.style.touchAction = 'none';
    extendElm.classList.add('bg-gray-200');
    lowerCanvasElm.classList.remove('hidden');
    upperCanvasElm.classList.remove('hidden');

    setCanvas(canvas);
    setCanvasInitDims(new Dimension(canvas_w, canvas_h));
  };

  useEffect(initCanvas, [canvasElm]);

  window.onresize = () => {
    if (!canvas) return;

    const { w: canvas_w, h: canvas_h } = calcCanvasDims();
    canvas.setWidth(canvas_w);
    canvas.setHeight(canvas_h);

    const vpt = canvas.viewportTransform as number[];
    const zoom = canvas.getZoom();
    const { w: initW, h: initH } = canvasInitDims!;

    if (canvas_w >= initW * zoom) vpt[4] = (canvas_w - initW * zoom) / 2;

    if (canvas_h >= initH * zoom) vpt[5] = (canvas_h - initH * zoom) / 2;

    canvas.setViewportTransform(vpt);
  };

  return (
    <div
      className='h-full relative pb-7 md:pb-9 select-none w-full flex justify-center items-center overflow-y-hidden'
      id='canvas_extended'
    >
      <canvas ref={canvasElm} className='hidden' />
      {/* <LoadingIcon /> */}
    </div>
  );
};
