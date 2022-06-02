import { fabric } from 'fabric';
import { useEffect, useRef } from 'react';
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

export const useData = ({
  imagesList,
  initIndex = 0,
  onSave,
  onSwitch,
}: {
  imagesList: ImageData[];
  initIndex: number;
  onSave?: (
    curImageData: ImageData,
    curIndex: number,
    imagesList: ImageData[]
  ) => void;
  onSwitch?: (
    curImageData: ImageData,
    curIndex: number,
    imagesList: ImageData[],
    type: 'prev' | 'next'
  ) => void;
}) => {
  // initialize images list
  const {
    state: imageData,
    currentIndex: imageIndex,
    updateState: updateImageData,
    prev,
    next,
  } = useStateList<ImageData>(imagesList, initIndex);

  const [curState, setStack, updateCanSave] = useStore(
    CanvasStore,
    (s: CanvasStoreProps) => [s.curState(), s.setStack, s.updateCanSave]
  );

  const {
    canvas,
    setInitDims: setCanvasInitDims,
    setDataLoadingState,
  } = useStore(CanvasMetaStore, (s: CanvasMetaStoreProps) => s);

  const { setImage, setImageMeta } = useStore(
    ImageMetaStore,
    (s: ImageMetaStoreProps) => s
  );

  const [selectObjects, selectedCategory] = useStore(
    SelectionStore,
    (s: SelectionStoreProps) => [s.selectObjects, s.category]
  );

  const operation: DataOperation = {
    save: () => {
      const updatedData = { ...imageData, annotations: curState };
      updateImageData(updatedData);
      updateCanSave(false);
      onSave && onSave(updatedData, imageIndex, imagesList);
    },

    prevImg: () => {
      const updatedData = { ...imageData, annotations: curState };
      updateImageData(updatedData);
      onSwitch && onSwitch(updatedData, imageIndex, imagesList, 'prev');
      prev();
    },
    nextImg: () => {
      const updatedData = { ...imageData, annotations: curState };
      updateImageData(updatedData);
      onSwitch && onSwitch(updatedData, imageIndex, imagesList, 'next');
      next();
    },
  };

  const theLastLoadImageUrl = useRef<string>();
  const imageCache = useRef<fabric.Image[]>(new Array(imagesList.length));

  useEffect(() => {
    updateCanSave(
      JSON.stringify(curState) !== JSON.stringify(imageData.annotations)
    );
  }, [curState]);

  useEffect(() => {
    if (!canvas) return;

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
    setImageMeta({ dims: imageDims, scale, offset, boundary: imageBoundary });
    setCanvasInitDims(new Dimension(canvas_w, canvas_h));

    // load image
    theLastLoadImageUrl.current = imageData.url; // record the last target image to prevent the loading dislocation
    if (imageCache.current[imageIndex]) {
      setDataLoadingState({ annosState: DataState.Loading });
      setImage(imageCache.current[imageIndex]);
    } else {
      setDataLoadingState({
        imageState: DataState.Loading,
        annosState: DataState.Loading,
      });

      const { x: left, y: top } = offset;
      const [scaleX, scaleY] = [scale, scale];

      fabric.Image.fromURL(
        imageData.url,
        (img: fabric.Image) => {
          const { width, height } = img;
          if (theLastLoadImageUrl.current === imageData.url) {
            if (width && height) {
              imageCache.current[imageIndex] = img;
              setImage(img);
              setDataLoadingState({ imageState: DataState.Ready });
            } else setDataLoadingState({ imageState: DataState.Error });
          }
        },
        { left, top, scaleX, scaleY }
      );
    }

    // load annotations
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

    const categoryInterestedAnnos = annos.filter(
      ({ category }) => category === selectedCategory
    );
    selectObjects(categoryInterestedAnnos, true);
    setDataLoadingState({ annosState: DataState.Ready });
  }, [imageIndex, canvas]);

  return operation;
};
