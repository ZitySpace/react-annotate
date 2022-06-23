import { createContext } from 'react';
import { createStore, State, StoreApi } from 'zustand';
import cv from '@techstark/opencv-js';

interface StoreData extends State {
  ready: boolean;
  intelligentScissor: any;
  img: cv.Mat | null;
}

const StoreDataDefault = {
  ready: false,
  intelligentScissor: null,
  img: null,
};

interface Store extends StoreData {
  setReady: () => void;
  initIntelligentScissor: (image: HTMLImageElement) => void;
}

let cvReadyCallback: Function | null = null;

const store = createStore<Store>((set, get) => ({
  ...StoreDataDefault,
  setReady: () => {
    set({ ready: true });
    cvReadyCallback && cvReadyCallback();
  },
  initIntelligentScissor: (image: HTMLImageElement) => {
    const { img: existingImg, intelligentScissor: existingScissor } = get();
    if (existingScissor) existingScissor.delete();
    if (existingImg) existingImg.delete();

    const operation = () => {
      const img = cv.imread(image);
      const newScissor = new cv['segmentation_IntelligentScissorsMB']();
      newScissor.setEdgeFeatureCannyParameters(32, 100);
      newScissor.setGradientMagnitudeMaxLimit(200);
      newScissor.applyImage(img);
      set({ img, intelligentScissor: newScissor });
    };

    if (get().ready) operation();
    else cvReadyCallback = operation;
  },
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  Store as CVStoreProps,
  store as CVStore,
  StoreContext as CVStoreContext,
};
