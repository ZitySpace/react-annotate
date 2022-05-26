import { fabric } from 'fabric';
import { useEffect, useRef, useState } from 'react';
import { useStore } from 'zustand';
import { Dimension } from '../classes/Geometry/Dimension';
import { PolygonLabel } from '../classes/Label/PolygonLabel';
import { DataState, ImageData } from '../interfaces/basic';
import {
  CanvasMetaStore,
  CanvasMetaStoreProps,
} from '../stores/CanvasMetaStore';
import { CanvasStore, CanvasStoreProps } from '../stores/CanvasStore';
import { ImageMetaStore, ImageMetaStoreProps } from '../stores/ImageMetaStore';
import { SelectionStore, SelectionStoreProps } from '../stores/SelectionStore';
import { isPolygon } from '../utils/label';
import { useStateList } from './useStateList';

export interface DataOperation {
  prevImg: () => void;
  nextImg: () => void;
  save: () => void;
}

export const useData = (imagesList: ImageData[], initIndex: number = 0) => {
  // initialize images list
  const {
    state: imageData,
    currentIndex: imageIndex,
    updateState: updateImageData,
    prev,
    next,
  } = useStateList<ImageData>(imagesList, initIndex);

  const { curState, setStack } = useStore(
    CanvasStore,
    (s: CanvasStoreProps) => s
  );

  const { canvas, setInitDims: setCanvasInitDims } = useStore(
    CanvasMetaStore,
    (s: CanvasMetaStoreProps) => s
  );

  const { setImage, setImageMeta } = useStore(
    ImageMetaStore,
    (s: ImageMetaStoreProps) => s
  );

  const [selectObjects, selectedCategory] = useStore(
    SelectionStore,
    (s: SelectionStoreProps) => [s.selectObjects, s.category]
  );

  const operation = {
    save: () => {
      updateImageData({ ...imageData, annotations: curState() });
      return true;
    },

    prevImg: () => operation.save() && prev(),
    nextImg: () => operation.save() && next(),
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
        if (theLastLoadImageUrl.current === imageData.url) {
          if (width && height) {
            setImage(img);
            setImageLoadingState(DataState.Ready);
          } else setImageLoadingState(DataState.Error);
        }
      },
      { left, top, scaleX, scaleY }
    );

    setImageMeta({ dims: imageDims, scale, offset, boundary: imageBoundary });

    const annos = imageData.annotations;
    annos.forEach((anno) => anno.scaleTransform(scale, offset));
    annos.sort((a, b) => {
      if (isPolygon(a) && !isPolygon(b)) return -1;
      else if (isPolygon(b) && !isPolygon(a)) return 1;
      else if (!isPolygon(a) && !isPolygon(b)) return 0;
      else
        return (
          (b as PolygonLabel).boundary.getSize() -
          (a as PolygonLabel).boundary.getSize()
        );
    });
    setStack([annos]);
    setCanvasInitDims(new Dimension(canvas_w, canvas_h));

    const categoryInterestedAnnos = annos.filter(
      ({ category }) => category === selectedCategory
    );
    selectObjects(categoryInterestedAnnos, true);

    setAnnosInitState(DataState.Ready);
  }, [imageIndex, canvas]);

  return {
    dataReady:
      imageLoadingState === DataState.Ready &&
      annosInitState === DataState.Ready,
    dataOperation: operation,
  };
};
