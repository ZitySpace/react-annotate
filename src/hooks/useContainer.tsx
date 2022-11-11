import { fabric } from 'fabric';
import React, { useEffect, useRef } from 'react';
import { CANVAS_CONFIG } from '../labels/config';

import {
  CanvasMetaStore,
  CanvasMetaStoreProps,
} from '../stores/CanvasMetaStore';
import { useStore } from 'zustand';
import { SpinnerIcon, WarningIcon } from '../components/Icons';
import { ImageMetaStore, ImageMetaStoreProps } from '../stores/ImageMetaStore';

export const useContainer = () => {
  const canvasElmRef = useRef<HTMLCanvasElement | null>(null);

  const {
    canvas,
    initSize: canvasInitSize,
    setCanvas,
    setInitSize: setCanvasInitSize,
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
    return [canvas_w, canvas_h];
  };

  const initCanvas = () => {
    const canvas = new fabric.Canvas(canvasElmRef.current, CANVAS_CONFIG);

    const [canvas_w, canvas_h] = calcCanvasDims();
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
    setCanvasInitSize(canvas_w, canvas_h);
  };

  useEffect(initCanvas, [canvasElmRef]);

  window.onresize = () => {
    if (!canvas) return;

    const [curW, curH] = calcCanvasDims();
    canvas.setWidth(curW);
    canvas.setHeight(curH);

    const vpt = canvas.viewportTransform as number[];
    const zoom = canvas.getZoom();
    const { w: initW, h: initH } = canvasInitSize!;

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
      <div
        className={`${
          isCached(name) || dataReady || dataError ? 'hidden' : ''
        }`}
      >
        <SpinnerIcon />
      </div>
      <div
        className={`flex flex-col justify-center items-center space-y-4 text-gray-800 ${
          dataError ? '' : 'hidden'
        }`}
        style={{ zIndex: 999 }}
      >
        <WarningIcon />
        <p>Unable to load the picture, please check your network connection.</p>
      </div>
    </div>
  );
};
