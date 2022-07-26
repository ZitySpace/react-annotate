import { fabric } from 'fabric';
import React, { createContext, createRef } from 'react';
import { createStore, State, StoreApi } from 'zustand';

export interface TrySwitchGroupFunction {
  (e: fabric.IEvent<Event>, currentGroup: string): {
    pointer: fabric.Point | undefined;
    switched: boolean;
    target: fabric.Object | undefined;
    evt: MouseEvent;
  };
}

interface StoreData extends State {
  lastPosition: React.MutableRefObject<fabric.Point>;
  origPosition: React.MutableRefObject<{ x: number; y: number }>;
  isPanning: React.MutableRefObject<boolean>;
  isDrawing: React.MutableRefObject<boolean>;
  isEditing: React.MutableRefObject<boolean>;
  isObjectMoving: React.MutableRefObject<boolean>;
  trySwitchGroup: React.MutableRefObject<TrySwitchGroupFunction>;
  setListeners: React.MutableRefObject<(group: string) => void>;
  refreshListeners: React.MutableRefObject<() => void>;
  resetListeners: React.MutableRefObject<() => void>;
}

let lastPosition =
  createRef<fabric.Point>() as React.MutableRefObject<fabric.Point>;
lastPosition.current = new fabric.Point(0, 0);

let origPosition = createRef<{
  x: number;
  y: number;
}>() as React.MutableRefObject<{ x: number; y: number }>;
origPosition.current = { x: 0, y: 0 };

let isPanning = createRef<boolean>() as React.MutableRefObject<boolean>;
isPanning.current = false;

let isDrawing = createRef<boolean>() as React.MutableRefObject<boolean>;
isDrawing.current = false;

let isEditing = createRef<boolean>() as React.MutableRefObject<boolean>;
isEditing.current = false;

let isObjectMoving = createRef<boolean>() as React.MutableRefObject<boolean>;
isObjectMoving.current = false;

let trySwitchGroup =
  createRef<TrySwitchGroupFunction>() as React.MutableRefObject<TrySwitchGroupFunction>;

let setListeners = createRef<
  (group: string) => void
>() as React.MutableRefObject<(group: string) => void>;

let refreshListeners = createRef<() => void>() as React.MutableRefObject<
  () => void
>;

let resetListeners = createRef<() => void>() as React.MutableRefObject<
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
  trySwitchGroup,
  setListeners,
  refreshListeners,
  resetListeners,
};

interface Store extends StoreData {}

const store = createStore<Store>((set) => ({
  ...StoreDataDefault,
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  Store as ListenerStoreProps,
  store as ListenerStore,
  StoreContext as ListenerStoreContext,
};
