import { fabric } from 'fabric';
import { useEffect, useRef } from 'react';
import { useStore } from 'zustand';
import { DataState, ImageData } from '../interfaces/basic';
import {
  CanvasMetaStore,
  CanvasMetaStoreProps,
} from '../stores/CanvasMetaStore';
import { CanvasStore, CanvasStoreProps } from '../stores/CanvasStore';
import { CVStore, CVStoreProps } from '../stores/CVStore';
import { ImageMetaStore, ImageMetaStoreProps } from '../stores/ImageMetaStore';
import { SelectionStore, SelectionStoreProps } from '../stores/SelectionStore';
import {
  InteractionStore,
  InteractionStoreProps,
} from '../stores/InteractionStore';
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

  const { selectLabels, category: selectedCategory } = useStore(
    SelectionStore,
    (s: SelectionStoreProps) => s
  );

  const { setMode: setInteractionMode } = useStore(
    InteractionStore,
    (s: InteractionStoreProps) => s
  );

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
        setInteractionMode('none');
        onSwitch && onSwitch(updatedData, imageIndex, imagesList, 'prev');
      }
      prev();
    },

    nextImg: () => {
      if (dataReady) {
        const updatedData = { ...imageData, annotations: [...curState] };
        updateImageData(updatedData);
        setInteractionMode('none');
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
        const annos = [...imageData.annotations];
        annos.forEach((anno) =>
          anno.toCanvasCoordSystem({ scale, offset }, true)
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
