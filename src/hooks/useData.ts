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
import { CVStore, CVStoreProps } from '../stores/CVStore';
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
  getImage,
  onSave,
  onSwitch,
  onError,
}: {
  imagesList: ImageData[];
  initIndex: number;
  getImage?: (imageName: string) => Promise<string>;
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
  onError?: (message: string, context: any) => void;
}) => {
  // initialize images list
  const {
    state: imageData,
    currentIndex: imageIndex,
    updateState: updateImageData,
    prev,
    next,
  } = useStateList<ImageData>(imagesList, initIndex);

  const { initIntelligentScissor } = useStore(CVStore, (s: CVStoreProps) => s);

  const [curState, setStack, updateCanSave] = useStore(
    CanvasStore,
    (s: CanvasStoreProps) => [s.curState(), s.setStack, s.updateCanSave]
  );

  const { canvas, setInitDims: setCanvasInitDims } = useStore(
    CanvasMetaStore,
    (s: CanvasMetaStoreProps) => s
  );

  const { setImage, setImageMeta, setDataLoadingState, dataReady, setName } =
    useStore(ImageMetaStore, (s: ImageMetaStoreProps) => s);

  const {
    selectObjects,
    setOperationStatus,
    category: selectedCategory,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  const theLastLoadImageName = useRef<string>();
  theLastLoadImageName.current = imageData.name;

  const operation: DataOperation = {
    save: () => {
      const updatedData = { ...imageData, annotations: [...curState] };
      updateImageData(updatedData);
      updateCanSave(false);
      onSave && onSave(updatedData, imageIndex, imagesList);
    },

    prevImg: () => {
      if (dataReady) {
        const updatedData = { ...imageData, annotations: [...curState] };
        updateImageData(updatedData);
        setOperationStatus('none');
        onSwitch && onSwitch(updatedData, imageIndex, imagesList, 'prev');
      }
      prev();
    },

    nextImg: () => {
      if (dataReady) {
        const updatedData = { ...imageData, annotations: [...curState] };
        updateImageData(updatedData);
        setOperationStatus('none');
        onSwitch && onSwitch(updatedData, imageIndex, imagesList, 'next');
      }
      next();
    },
  };

  useEffect(() => {
    updateCanSave(
      JSON.stringify(curState) !== JSON.stringify(imageData.annotations)
    );
  }, [curState]);

  useEffect(() => {
    if (!canvas) return;

    setName(imageData.name);
    setDataLoadingState(DataState.Loading);

    (async () => {
      const image = new Image();
      image.onload = () => {
        if (theLastLoadImageName.current !== imageData.name) return;

        // calculate the image dimensions and boundary, its scale and the offset
        // between canvas and image
        const [canvas_w, canvas_h] = [canvas.width!, canvas.height!];
        setCanvasInitDims(new Dimension(canvas_w, canvas_h));
        const [image_w, image_h] = [image.naturalWidth, image.naturalHeight];

        const scale_x = canvas_w / image_w;
        const scale_y = canvas_h / image_h;
        const scale = Math.min(scale_x, scale_y);
        const imageDims = new Dimension(image_w, image_h).zoom(scale);
        const canvasDims = new Dimension(canvas_w, canvas_h);
        const imageBoundary = imageDims.boundaryIn(canvasDims);
        const offset = imageDims.offsetTo(canvasDims);
        setImageMeta({
          dims: imageDims,
          scale,
          offset,
          boundary: imageBoundary,
        });

        // load annotations
        const annos = [...imageData.annotations];
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

        const { x: left, y: top } = offset;
        const [scaleX, scaleY] = [scale, scale];

        initIntelligentScissor(image);
        const img = new fabric.Image(image, { left, top, scaleX, scaleY });
        setImage(img, imageData.name);

        setDataLoadingState(DataState.Ready);
      };
      image.onerror = () => {
        onError &&
          onError('Load image failed', {
            name: imageData.name,
          });
        setDataLoadingState(DataState.Error);
      };

      try {
        if (imageData.url) image.src = imageData.url;
        else {
          if (!getImage)
            throw new Error(
              'Image url or getImage method has to be set to display images.'
            );
          image.src = await getImage(imageData.name);
        }
      } catch (err) {
        onError &&
          onError('Request image failed', {
            name: imageData.name,
            error: err instanceof Error ? err.message : (err as string),
          });
        setDataLoadingState(DataState.Error);
      }
    })();
  }, [imageData.name, canvas]);

  return operation;
};
