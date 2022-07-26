import { fabric } from 'fabric';
import { useEffect, useRef } from 'react';
import { useStore } from 'zustand';
import { DataState, ImageData, LabeledImageData } from '../interfaces/basic';
import { UNKNOWN_CATEGORY_NAME } from '../labels/config';
import { placeAtLast, labelsToAnnos } from '../utils';
import {
  CanvasMetaStore,
  CanvasMetaStoreProps,
} from '../stores/CanvasMetaStore';
import { CanvasStore, CanvasStoreProps } from '../stores/CanvasStore';
import { CVStore, CVStoreProps } from '../stores/CVStore';
import { ImageMetaStore, ImageMetaStoreProps } from '../stores/ImageMetaStore';
import { SelectionStore, SelectionStoreProps } from '../stores/SelectionStore';
import { useStateList } from './useStateList';

export interface DataOperation {
  prevImg: () => void;
  nextImg: () => void;
  save: () => void;
}

export const useData = ({
  imagesList,
  initIndex = 0,
  categories,
  getImage,
  onSave,
  onError,
}: {
  imagesList: LabeledImageData[];
  initIndex: number;
  categories?: string[];
  getImage?: (imageName: string) => Promise<string> | string;
  onSave: (curImageData: ImageData) => Promise<boolean> | boolean;
  onError?: (message: string, context?: any) => void;
}) => {
  // initialize images list
  const {
    prev,
    next,
    setIndex,
    state: imageState,
    currentIndex: imageIndex,
    updateState: updateImageData,
  } = useStateList<LabeledImageData>(imagesList, initIndex);

  const { initIntelligentScissor } = useStore(CVStore, (s: CVStoreProps) => s);

  const [curState, setStack, canSave] = useStore(
    CanvasStore,
    (s: CanvasStoreProps) => [s.curState(), s.setStack, s.canSave]
  );

  const { canvas, setInitSize: setCanvasInitSize } = useStore(
    CanvasMetaStore,
    (s: CanvasMetaStoreProps) => s
  );

  const {
    setImage,
    setImageSize,
    setScaleOffset,
    setDataLoadingState,
    dataReady,
    setName,
  } = useStore(ImageMetaStore, (s: ImageMetaStoreProps) => s);

  const {
    selectLabels,
    category: selectedCategory,
    categories: categoriesInStore,
    setCategories: setCategoriesInStore,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  const imageData = imageState
    ? imageState
    : { name: '', src: '', annotations: [] };

  const theLastLoadImageName = useRef<string>();
  theLastLoadImageName.current = imageData.name;

  const operation: DataOperation = {
    save: async () => {
      if (!canSave) return;

      // always save raw annotations in imageCoordSystem for imageData
      const updatedData = {
        ...imageData,
        annotations: curState.map((anno) => anno.toImageCoordSystem(false)),
      };
      updateImageData(updatedData);

      const updatedDataRaw = {
        ...updatedData,
        annotations: labelsToAnnos(updatedData.annotations),
      };
      if (!(await onSave(updatedDataRaw)))
        console.log(`failed to save annotations for ${imageData.name}`);
    },

    prevImg: () => {
      if (dataReady) operation.save();
      prev();
    },

    nextImg: () => {
      if (dataReady) operation.save();
      next();
    },
  };

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
        setCanvasInitSize(canvas_w, canvas_h);
        const [image_w, image_h] = [image.naturalWidth, image.naturalHeight];
        setImageSize(image_w, image_h);

        const scale_x = canvas_w / image_w;
        const scale_y = canvas_h / image_h;
        const scale = Math.min(scale_x, scale_y);
        const offset = {
          x: (canvas_w - image_w * scale) / 2,
          y: (canvas_h - image_h * scale) / 2,
        };
        setScaleOffset({ scale, offset });

        // load annotations
        const annos = imageData.annotations.map((anno) =>
          anno.toCanvasCoordSystem({ scale, offset }, false)
        );

        // TODO: sort annotations by ascending size

        setStack([annos]);

        selectLabels(
          annos.filter(({ category }) => category === selectedCategory),
          true
        );

        const { x: left, y: top } = offset;
        const [scaleX, scaleY] = [scale, scale];

        initIntelligentScissor(image);
        const img = new fabric.Image(image, { left, top, scaleX, scaleY });
        setImage(img, imageData.name);

        setDataLoadingState(DataState.Ready);
      };

      image.onerror = () => {
        onError &&
          onError('Failed to load image', {
            name: imageData.name,
          });

        if (theLastLoadImageName.current !== imageData.name) return;

        setStack([[]]);
        selectLabels([], true);
        setDataLoadingState(
          DataState.Error,
          'Failed to load image, please check image url or network connection.'
        );
      };

      if (imageData.url) image.src = imageData.url;
      else if (imageData.name && getImage) {
        try {
          image.src = await getImage(imageData.name);
        } catch (err) {
          onError &&
            onError('Failed to request image', {
              name: imageData.name,
              error: err instanceof Error ? err.message : (err as string),
            });

          if (theLastLoadImageName.current !== imageData.name) return;

          setStack([[]]);
          selectLabels([], true);
          setDataLoadingState(
            DataState.Error,
            err instanceof Error ? err.message : (err as string)
          );
        }
      } else {
        onError && onError('Empty or invalid image data');
        setStack([[]]);
        selectLabels([], true);
        setDataLoadingState(
          DataState.Error,
          'Empty or invalid image data, please check image annotations.'
        );
      }
    })();
  }, [imageData.name, canvas, imagesList]);

  useEffect(() => {
    setIndex(0);

    setCategoriesInStore(
      placeAtLast(
        [
          ...new Set([
            ...(categories || []),
            ...imagesList
              .map((d) => [...new Set(d.annotations.map((l) => l.category))])
              .flat(),
          ]),
        ],
        UNKNOWN_CATEGORY_NAME
      )
    );
  }, [imagesList]);

  return operation;
};
