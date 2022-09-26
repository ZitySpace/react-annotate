import { createContext } from 'react';
import { createStore, StoreApi } from 'zustand';

interface StoreData {
  ready: boolean;
  intelligentScissor: any;
  img: any;
  AIMode: boolean;
}

const StoreDataDefault = {
  ready: false,
  intelligentScissor: null,
  img: null,
  AIMode: false,
};

interface Store extends StoreData {
  setReady: () => void;
  initIntelligentScissor: (image: HTMLImageElement) => void;
  toggleAIMode: () => void;
}

let cvReadyCallback: Function | null = null;

const store = createStore<Store>((set, get) => ({
  ...StoreDataDefault,
  setReady: () => {
    window['cv']['onRuntimeInitialized'] = () => {
      set({ ready: true });
      cvReadyCallback && cvReadyCallback();
    };
  },
  initIntelligentScissor: (image: HTMLImageElement) => {
    const { img: existingImg, intelligentScissor: existingScissor } = get();
    if (existingScissor) existingScissor.delete();
    if (existingImg) existingImg.delete();

    const operation = () => {
      const cv = window['cv'];
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
  toggleAIMode: () => set((s) => ({ AIMode: !s.AIMode })),
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  Store as CVStoreProps,
  store as CVStore,
  StoreContext as CVStoreContext,
};
