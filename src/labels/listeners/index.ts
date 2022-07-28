import { useRef, useEffect } from 'react';
import { setup } from './setup';
import { useDefaultListeners } from './default';
import { useBoxListeners } from '../Box/listeners';
import { usePointListeners } from '../Point/listeners';
import { useLineListeners } from '../Line/listeners';
import { LabelType, LabeledObject } from '../Base';
import { parseEvent } from '../utils';
import { useMaskListeners } from '../Mask/listeners';

export const useListeners = (syncCanvasToState: () => void) => {
  const listenerGroup = useRef<string>('default');

  const {
    canvas,
    selectedLabels,
    drawType,
    isPanning,
    isDrawing,
    isEditing,
    isObjectMoving,
    trySwitchGroupRef,
    setListenersRef,
    refreshListenersRef,
    resetListenersRef,
  } = setup();

  const { sharedListeners, defaultListeners } = useDefaultListeners();

  const { drawBoxListeners, editBoxListeners } =
    useBoxListeners(syncCanvasToState);

  const { drawPointListeners, editPointListeners } =
    usePointListeners(syncCanvasToState);

  const { drawLineListeners, editLineListeners } =
    useLineListeners(syncCanvasToState);

  const { drawMaskListeners, editMaskListeners } =
    useMaskListeners(syncCanvasToState);

  useEffect(() => {
    if (!canvas) return;
    refreshListeners();
  }, [selectedLabels]);

  useEffect(() => {
    if (!canvas) return;

    const group = drawType === LabelType.None ? 'default' : drawType + ':draw';
    setListeners(group);
  }, [drawType]);

  if (!canvas)
    return {
      setListeners: () => {},
      refreshListeners: () => {},
      resetListeners: () => {},
    };

  const setListeners = (group: string) => {
    isPanning.current = false;
    isDrawing.current = false;
    isEditing.current = false;
    isObjectMoving.current = false;

    let listeners: { [key: string]: (e: fabric.IEvent<Event>) => void } = {};

    if (group === 'default')
      listeners = { ...sharedListeners, ...defaultListeners };

    if (group === 'box:edit')
      listeners = { ...sharedListeners, ...editBoxListeners };

    if (group === 'box:draw')
      listeners = { ...sharedListeners, ...drawBoxListeners };

    if (group === 'point:edit')
      listeners = { ...sharedListeners, ...editPointListeners };

    if (group === 'point:draw')
      listeners = { ...sharedListeners, ...drawPointListeners };

    if (group === 'line:edit')
      listeners = { ...sharedListeners, ...editLineListeners };

    if (group === 'line:draw')
      listeners = { ...sharedListeners, ...drawLineListeners };

    if (group === 'mask:edit')
      listeners = { ...sharedListeners, ...editMaskListeners };

    if (group === 'mask:draw')
      listeners = { ...sharedListeners, ...drawMaskListeners };

    canvas.off();
    Object.entries(listeners).forEach(([event, handler]) =>
      canvas.on(event, handler)
    );

    listenerGroup.current = group;
  };

  const trySwitchGroup = (e: fabric.IEvent<Event>, currGroup: string) => {
    const { pointer, target, evt } = parseEvent(e as fabric.IEvent<MouseEvent>);
    const newGroup =
      target && target.type !== 'textbox'
        ? (target as LabeledObject).labelType + ':edit'
        : 'default';

    if (currGroup === newGroup)
      return { pointer, switched: false, target, evt };

    setListeners(newGroup);

    if (e.e.type === 'mousemove')
      canvas.fire('mouse:over', { target, pointer });

    return { pointer, switched: true, target, evt };
  };

  const refreshListeners = () => setListeners(listenerGroup.current);
  const resetListeners = () => setListeners('default');

  trySwitchGroupRef.current = trySwitchGroup;
  setListenersRef.current = setListeners;
  refreshListenersRef.current = refreshListeners;
  resetListenersRef.current = resetListeners;

  return {
    setListeners,
    refreshListeners,
    resetListeners,
  };
};