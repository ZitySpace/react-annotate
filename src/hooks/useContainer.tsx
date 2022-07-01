import { fabric } from 'fabric';
import React, { useEffect, useRef } from 'react';
import { Dimension } from '../classes/Geometry/Dimension';
import { CANVAS_CONFIG } from '../interfaces/config';

import {
  CanvasMetaStore,
  CanvasMetaStoreProps,
} from '../stores/CanvasMetaStore';
import { useStore } from 'zustand';
import { SpinnerIcon, WarningIcon } from '../components/Icons';
import { ImageMetaStore, ImageMetaStoreProps } from '../stores/ImageMetaStore';

export interface UseContainerReturnProps {
  Container: JSX.Element; // canvas dom
  canvas: fabric.Canvas | null;
  canvasDims: Dimension | null;
}

export const useContainer = () => {
  const canvasElmRef = useRef<HTMLCanvasElement | null>(null);

  const {
    canvas,
    initDims: canvasInitDims,
    setCanvas,
    setInitDims: setCanvasInitDims,
  } = useStore(CanvasMetaStore, (s: CanvasMetaStoreProps) => s);

  const { name, isCached, dataReady, dataError } = useStore(
    ImageMetaStore,
    (s: ImageMetaStoreProps) => s
  );

  const calcCanvasDims = () => {
    const extendElm = document.getElementById('canvas_extended') as HTMLElement;
    const { width: canvas_w, height: _canvas_h } =
      extendElm.getBoundingClientRect(); // get canvas extend element dimensions
    const canvas_h = _canvas_h - 36; // minus the buttons bar's height
    return new Dimension(canvas_w, canvas_h);
  };

  const initCanvas = () => {
    const canvas = new fabric.Canvas(canvasElmRef.current, CANVAS_CONFIG);

    const canvasDims = calcCanvasDims();
    const { w: canvas_w, h: canvas_h } = canvasDims;
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
    setCanvasInitDims(canvasDims);
  };

  useEffect(initCanvas, [canvasElmRef]);

  window.onresize = () => {
    if (!canvas) return;

    const { w: curW, h: curH } = calcCanvasDims();
    canvas.setWidth(curW);
    canvas.setHeight(curH);

    const vpt = canvas.viewportTransform as number[];
    const zoom = canvas.getZoom();
    const { w: initW, h: initH } = canvasInitDims!;

    if (curW >= initW * zoom) vpt[4] = (curW - initW * zoom) / 2;
    if (curH >= initH * zoom) vpt[5] = (curH - initH * zoom) / 2;
    canvas.setViewportTransform(vpt);
  };

  return (
    <div
      className='h-full relative pb-9 select-none w-full flex justify-center items-center overflow-y-hidden'
      id='canvas_extended'
    >
      <canvas ref={canvasElmRef} className='hidden' />
      <SpinnerIcon
        className={`${
          isCached(name) || dataReady || dataError ? 'hidden' : ''
        }`}
      />
      <div
        className={`flex flex-col text-gray-800 ${dataError ? '' : 'hidden'}`}
        style={{ zIndex: 999 }}
      >
        <WarningIcon className='m-auto' />
        <p>Unable to load the picture, please check your network connection.</p>
      </div>
    </div>
  );
};
