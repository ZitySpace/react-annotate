import { fabric } from 'fabric';
import { useEffect, useRef, useState } from 'react';
import { useStateList } from 'react-use';
import { Boundary } from '../classes/Geometry/Boundary';
import { Dimension } from '../classes/Geometry/Dimension';
import { Point } from '../classes/Geometry/Point';
import { ImageData, DataState } from '../interfaces/basic';
import { useStore } from 'zustand';
import { CanvasStore, CanvasStoreProps } from '../stores/CanvasStore';
import {
  CanvasMetaStore,
  CanvasMetaStoreProps,
} from '../stores/CanvasMetaStore';
import { ImageMetaStore, ImageMetaStoreProps } from '../stores/ImageMetaStore';

export interface DataOperation {
  prevImg: () => void;
  nextImg: () => void;
  save: () => void;
}

export const useData = (imagesList: ImageData[], initIndex: number = 0) => {
  // initialize images list
  const {
    state: imageData,
    setStateAt: setImageIdx,
    prev,
    next,
  } = useStateList<ImageData>(imagesList); // refer: https://github.com/streamich/react-use/blob/master/docs/useStateList.md

  const setStack = useStore(CanvasStore, (s: CanvasStoreProps) => s.setStack);

  const { canvas, setInitDims: setCanvasInitDims } = useStore(
    CanvasMetaStore,
    (s: CanvasMetaStoreProps) => s
  );

  const { setImage, setImageMeta } = useStore(
    ImageMetaStore,
    (s: ImageMetaStoreProps) => s
  );

  const operation = {
    save: () => {
      console.log('Save called but not Implemented');
    },

    prevImg: () => (prev() as undefined) || operation.save(),
    nextImg: () => (next() as undefined) || operation.save(),
  };

  const [annosInitState, setAnnosInitState] = useState<DataState>(
    DataState.Loading
  );
  const [imageLoadingState, setImageLoadingState] = useState<DataState>(
    DataState.Loading
  );
  const theLastLoadImageUrl = useRef<string>();

  useEffect(() => {
    if (!canvas) return;

    theLastLoadImageUrl.current = imageData.url;
    setImageLoadingState(DataState.Loading);
    setAnnosInitState(DataState.Loading);

    // calculate the image dimensions and boundary, its scale and the offset between canvas and image
    const { width: image_w, height: image_h } = imageData;
    const [canvas_w, canvas_h] = [canvas.width!, canvas.height!];
    const scale_x = canvas_w / image_w;
    const scale_y = canvas_h / image_h;
    const scale = Math.min(scale_x, scale_y);
    const imageDims = new Dimension(image_w, image_h).zoom(scale);
    const canvasDims = new Dimension(canvas_w, canvas_h);
    const imageBoundary = imageDims.boundaryIn(canvasDims);
    const offset = imageDims.offsetTo(canvasDims);

    const { x: left, y: top } = offset;
    const [scaleX, scaleY] = [scale, scale];

    fabric.Image.fromURL(
      imageData.url,
      (img: fabric.Image) => {
        const { width, height } = img;
        if (width && height) {
          if (theLastLoadImageUrl.current === imageData.url) {
            setImage(img);
            setImageLoadingState(DataState.Ready);
          }
        } else setImageLoadingState(DataState.Error);
      },
      { left, top, scaleX, scaleY, url: imageData.url } as any
    );

    setImageMeta({ dims: imageDims, scale, offset, boundary: imageBoundary });

    const annos = imageData.annotations;
    annos.forEach((anno) => anno.scaleTransform(scale, offset));
    setStack([annos]);
    setCanvasInitDims(new Dimension(canvas_w, canvas_h));

    setAnnosInitState(DataState.Ready);
  }, [imageData]);

  useEffect(() => {
    initIndex && setImageIdx(initIndex);
  }, []);

  return {
    dataReady:
      imageLoadingState === DataState.Ready &&
      annosInitState === DataState.Ready,
    dataOperation: operation,
  };
};
