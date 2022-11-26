import { fabric } from 'fabric';
import React, { createContext, createRef } from 'react';
import { createStore, StoreApi } from 'zustand';

export interface TrySwitchGroupFunction {
  (e: fabric.IEvent<Event>, currentGroup: string): {
    pointer: fabric.Point | undefined;
    switched: boolean;
    target: fabric.Object | undefined;
    evt: MouseEvent;
  };
}

interface StoreData {
  lastPosition: React.MutableRefObject<fabric.Point>;
  origPosition: React.MutableRefObject<{ x: number; y: number }>;
  isPanning: React.MutableRefObject<boolean>;
  isDrawing: React.MutableRefObject<boolean>;
  isEditing: React.MutableRefObject<boolean>;
  isObjectMoving: React.MutableRefObject<boolean>;
  listenerGroup: React.MutableRefObject<string>;
  trySwitchGroup: React.MutableRefObject<TrySwitchGroupFunction>;
  setListeners: React.MutableRefObject<(group: string) => void>;
  refreshListeners: React.MutableRefObject<() => void>;
  resetListeners: React.MutableRefObject<() => void>;
}

const lastPosition =
  createRef<fabric.Point>() as React.MutableRefObject<fabric.Point>;
lastPosition.current = new fabric.Point(0, 0);

const origPosition = createRef<{
  x: number;
  y: number;
}>() as React.MutableRefObject<{ x: number; y: number }>;
origPosition.current = { x: 0, y: 0 };

const isPanning = createRef<boolean>() as React.MutableRefObject<boolean>;
isPanning.current = false;

const isDrawing = createRef<boolean>() as React.MutableRefObject<boolean>;
isDrawing.current = false;

const isEditing = createRef<boolean>() as React.MutableRefObject<boolean>;
isEditing.current = false;

const isObjectMoving = createRef<boolean>() as React.MutableRefObject<boolean>;
isObjectMoving.current = false;

const listenerGroup = createRef<string>() as React.MutableRefObject<string>;
listenerGroup.current = 'default';

const trySwitchGroup =
  createRef<TrySwitchGroupFunction>() as React.MutableRefObject<TrySwitchGroupFunction>;

const setListeners = createRef<
  (group: string) => void
>() as React.MutableRefObject<(group: string) => void>;

const refreshListeners = createRef<() => void>() as React.MutableRefObject<
  () => void
>;

const resetListeners = createRef<() => void>() as React.MutableRefObject<
  () => void
>;

const StoreDataDefault = {
  // lastPosition is relative mouse coords on the viewport,
  // e.g. top-left is always (0,0)
  lastPosition,
  // origPosition is absolute coords on the canvas,
  // e.g. top-left of image is always (offset.x, offset.y)
  origPosition,
  isPanning,
  isDrawing,
  isEditing,
  isObjectMoving,
  listenerGroup,
  trySwitchGroup,
  setListeners,
  refreshListeners,
  resetListeners,
};

type Store = StoreData;

const store = createStore<Store>((set) => ({
  ...StoreDataDefault,
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  Store as ListenerStoreProps,
  store as ListenerStore,
  StoreContext as ListenerStoreContext,
};
