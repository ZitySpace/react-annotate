import { fabric } from 'fabric';
import React, { useState, useRef } from 'react';
import { useStore } from 'zustand';
import { KeypointsStore, KeypointsStoreProps } from './store';
import {
  KeypointsLabel,
  keypointsLabelConfig as cfg,
  colorMap,
  nColor,
} from './label';
import { LabeledObject, LabelType } from '../Base';
import { getLocalTimeISOString } from '../utils';
import { CanvasStore, CanvasStoreProps } from '../../stores/CanvasStore';
import {
  CanvasMetaStore,
  CanvasMetaStoreProps,
} from '../../stores/CanvasMetaStore';
import {
  SelectionStore,
  SelectionStoreProps,
} from '../../stores/SelectionStore';
import { ListenerStore, ListenerStoreProps } from '../../stores/ListenerStore';
import {
  MultipleSelectIcon,
  FoldIcon,
  CheckAllIcon,
  CheckUnAssignedIcon,
  ReplaceIcon,
} from '../../components/Icons';
import { RADIUS } from '../config';

const OperationPanel = () => {
  const [curState, pushState] = useStore(CanvasStore, (s: CanvasStoreProps) => [
    s.curState(),
    s.pushState,
  ]);

  const canvas = useStore(
    CanvasMetaStore,
    (s: CanvasMetaStoreProps) => s.canvas
  );

  const { labels: selectedLabels, selectLabels } = useStore(
    SelectionStore,
    (s: SelectionStoreProps) => s
  );

  const { listenerGroup } = useStore(
    ListenerStore,
    (s: ListenerStoreProps) => s
  );

  const {
    pids: selectedPids,
    setPids: selectPids,
    multi: multiPids,
    toggleMulti: toggleMultiPids,
  } = useStore(KeypointsStore, (s: KeypointsStoreProps) => s);

  const { structure } = cfg;
  const sids = [...new Set<number>(structure.flat())].sort((a, b) => a - b);

  const hasKeypointsLabel = curState.some(
    (s) => s.labelType === LabelType.Keypoints
  );
  const disabled =
    selectedLabels.length !== 1 ||
    selectedLabels[0].labelType !== LabelType.Keypoints;

  const pidsInfo: {
    [key: number]: {
      sid: number;
      vis: boolean;
      x: number;
      y: number;
      pid?: number;
    };
  } = {};
  const sidsInfo: { [key: number]: { pid: number; vis: boolean } } = {};
  const assigned: number[] = [];
  const unassigned: number[] = [];
  if (!disabled) {
    (selectedLabels[0] as KeypointsLabel).keypoints.forEach((p) => {
      pidsInfo[p.pid!] = { ...p };
      if (p.sid !== -1) {
        sidsInfo[p.sid] = { pid: p.pid!, vis: p.vis };
        assigned.push(p.pid!);
      } else unassigned.push(p.pid!);
    });
  }

  // assigned keypoints sorted by sid
  assigned.sort((pid1, pid2) => pidsInfo[pid1].sid - pidsInfo[pid2].sid);
  // unassigned keypoints sorted by pid
  unassigned.sort((pid1, pid2) => pid1 - pid2);

  const equals = (arr1: number[], arr2: number[]) =>
    arr1.length > 0 &&
    arr1.length === arr2.length &&
    arr1.every((i) => arr2.includes(i));

  const [fold, setFold] = useState<boolean>(false);
  const check = disabled
    ? 'default'
    : assigned.length && selectedPids.length === Object.values(pidsInfo).length
    ? 'all'
    : equals(unassigned, selectedPids)
    ? 'unassigned'
    : 'default';

  const [overwrite, setOverwrite] = useState<boolean>(false);

  const advDrawing = listenerGroup.current === 'keypoints:draw:advanced';

  const animation = useRef<NodeJS.Timer | null>(null);

  const hlAnimation = (pid: number, startOrStop: string) => {
    if (!canvas || disabled) return;

    const circle = canvas.getObjects().find((obj) => {
      const obj_ = obj as LabeledObject;
      return (
        obj_.id === selectedLabels[0].id &&
        obj_.labelType === LabelType.Keypoints &&
        (obj_ as any).pid === pid
      );
    }) as fabric.Circle;

    if (startOrStop === 'start')
      animation.current = setInterval(
        () =>
          circle.animate(
            'radius',
            circle.radius === RADIUS ? 2.0 * RADIUS : RADIUS,
            {
              duration: 200,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutCubic,
            }
          ),
        400
      );

    if (startOrStop === 'stop') {
      clearInterval(animation.current!);
      (fabric as any).runningAnimations.cancelAll();
      circle.set({
        radius: selectedPids.includes(pid) ? 1.5 * RADIUS : RADIUS,
      });
      canvas.requestRenderAll();
    }
  };

  const toggleVis = (pid: number) => {
    const { sid } = pidsInfo[pid];
    const selected = selectedPids.includes(pid);
    if (!selected) return;

    const newState = curState.map((label) => label.clone());
    const now = getLocalTimeISOString();
    const label = newState.find(
      (label) =>
        label.labelType === LabelType.Keypoints &&
        label.id === selectedLabels[0].id
    )! as KeypointsLabel;
    label.timestamp = now;
    label.keypoints.forEach((p) => {
      if (p.sid === sid && p.pid === pid) p.vis = !p.vis;
    });

    pushState(newState);
    selectLabels(newState.filter((label) => label.id === selectedLabels[0].id));
  };

  const unassign = (pid: number) => {
    const { sid } = pidsInfo[pid];
    const selected = selectedPids.includes(pid);

    if (!selected || sid === -1) return;

    const newState = curState.map((label) => label.clone());
    const now = getLocalTimeISOString();
    const label = newState.find(
      (label) =>
        label.labelType === LabelType.Keypoints &&
        label.id === selectedLabels[0].id
    )! as KeypointsLabel;
    label.timestamp = now;
    label.keypoints.forEach((p) => {
      if (p.sid === sid && p.pid === pid) p.sid = -1;
    });

    pushState(newState);
    selectLabels(newState.filter((label) => label.id === selectedLabels[0].id));
  };

  const assign = (startPos: number) => {
    const nSelected = selectedPids.length;
    if (!nSelected) return;

    const newState = curState.map((label) => label.clone());
    const now = getLocalTimeISOString();
    const label = newState.find(
      (label) =>
        label.labelType === LabelType.Keypoints &&
        label.id === selectedLabels[0].id
    )! as KeypointsLabel;

    let i = 0,
      j = 0,
      changed = false;

    for (const sid of sids.slice(startPos)) {
      if (i >= nSelected) break;

      const assigned = sidsInfo.hasOwnProperty(sid);
      const pid = selectedPids[i];
      const sid_ = pidsInfo[pid].sid;

      if (!overwrite && assigned) {
        if (j === 0) return;
        else {
          j++;
          if (sid_ === sid) i++;
          continue;
        }
      }

      if (sid_ !== sid) {
        if (sidsInfo.hasOwnProperty(sid_)) delete sidsInfo[sid_];

        if (assigned) {
          const pid_ = sidsInfo[sid].pid;
          pidsInfo[pid_].sid = -1;
        }

        pidsInfo[pid].sid = sid;
        sidsInfo[sid] = { pid, vis: pidsInfo[pid].vis };

        changed = true;
      }

      i++;
      j++;
    }

    if (!changed) return;

    label.keypoints = Object.values(pidsInfo);
    label.timestamp = now;

    pushState(newState);
    selectLabels(newState.filter((label) => label.id === selectedLabels[0].id));
  };

  return (
    <div
      className={`${
        hasKeypointsLabel ? 'ra-visible' : ''
      } ra-bg-gray-100 ra-bg-opacity-0 ra-absolute ra-top-20 ra-left-2 ra-max-h-full ra-flex ra-flex-col ra-text-xs ra-select-none`}
    >
      <div
        id='KeypointsStructure'
        className='ra-bg-indigo-400 ra-p-2 ra-w-[240px] ra-rounded-t-md ra-flex ra-justify-between hover:ra-cursor-grab '
      >
        <span className='ra-w-full ra-text-left ra-font-semibold'>
          Keypoints
        </span>
        <div className='ra-flex ra-justify-center ra-space-x-2'>
          <span
            className={`ra-text-indigo-200 hover:ra-cursor-pointer ${
              overwrite ? 'ra-text-indigo-600' : ''
            }`}
            onClick={() => setOverwrite(!overwrite)}
          >
            <ReplaceIcon />
          </span>
          <span
            className={`ra-text-indigo-200 hover:ra-cursor-pointer ${
              check === 'default' ? '' : 'ra-text-indigo-600'
            }`}
            onClick={() => {
              if (check === 'all') selectPids(unassigned);
              if (check === 'unassigned') selectPids();
              if (check === 'default') selectPids([...assigned, ...unassigned]);
            }}
          >
            {check === 'unassigned' ? (
              <CheckUnAssignedIcon />
            ) : (
              <CheckAllIcon />
            )}
          </span>
          <span
            className={`ra-text-indigo-200 hover:ra-cursor-pointer ${
              multiPids ? 'ra-text-indigo-600' : ''
            }`}
            onClick={toggleMultiPids}
          >
            <MultipleSelectIcon />
          </span>
          <span
            className={`ra-text-indigo-200 hover:ra-cursor-pointer ${
              fold ? 'ra-text-indigo-600' : ''
            }`}
            onClick={() => setFold(!fold)}
          >
            <FoldIcon />
          </span>
        </div>
      </div>

      <div
        className={`${
          disabled
            ? 'ra-bg-indigo-200 ra-pointer-events-none ra-text-gray-400'
            : advDrawing
            ? 'ra-bg-indigo-300 ra-pointer-events-none'
            : 'ra-bg-indigo-300'
        } ra-px-2 ra-pt-2 ra-pb-7 ra-flex ra-flex-col ra-space-y-2 ${
          fold ? 'ra-hidden' : ''
        }`}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <span className='ra-py-1 ra-font-semibold'>Assignment</span>

        <div className='ra-grid ra-grid-cols-6 ra-gap-x-4 ra-gap-y-7 ra-flex-row-reverse'>
          {sids.map((sid, i) => {
            const assigned = sidsInfo.hasOwnProperty(sid);
            const vis = assigned && sidsInfo[sid].vis;
            const selected =
              assigned && selectedPids.includes(sidsInfo[sid].pid);
            const idxOfSelected = assigned
              ? selectedPids.indexOf(sidsInfo[sid].pid)
              : -1;

            return (
              <div
                key={sid}
                className={`ra-w-6 ra-h-6 ra-rounded-full ra-relative ra-flex ra-justify-center ra-items-center ra-border-2 ${
                  assigned
                    ? 'ra-text-white ' +
                      (vis
                        ? 'ra-border-transparent'
                        : 'ra-border-black ra-border-opacity-75')
                    : ''
                }`}
                style={{
                  backgroundColor: assigned
                    ? colorMap[sid % nColor]
                    : 'rgb(229, 231, 235)',
                }}
                onClick={(e) => assign(i)}
              >
                <span>{sid}</span>
                {selected && (
                  <div className='ra-absolute -ra-bottom-7 ra-flex ra-flex-col ra-justify-between ra-items-center -ra-space-y-0.5'>
                    <span className='ra-w-2 ra-h-2 ra-rounded-full ra-bg-indigo-600'></span>
                    <span className='ra-font-extrabold ra-text-xs ra-text-indigo-600'>
                      {idxOfSelected + 1}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <span
          className={`ra-pb-1 ra-pt-5 ra-font-semibold ${
            disabled ? 'hidden' : ''
          }`}
        >
          Selection
        </span>

        <div
          className='ra-grid ra-grid-cols-6 ra-gap-x-4 ra-gap-y-7 ra-flex-row-reverse'
          onClick={(e) => {
            selectPids();
          }}
        >
          {[...assigned, ...unassigned].map((pid, i) => {
            const { vis, sid } = pidsInfo[pid];
            const assigned = sidsInfo.hasOwnProperty(sid);
            const selected = selectedPids.includes(pid);
            const idxOfSelected = selectedPids.indexOf(pid);

            return (
              <div
                key={i}
                className={`ra-w-6 ra-h-6 ra-rounded-full ra-relative ra-flex ra-justify-center ra-items-center ra-border-2 ${
                  assigned ? 'ra-text-white ' : ''
                } ${
                  vis
                    ? 'ra-border-transparent'
                    : 'ra-border-black ra-border-opacity-75'
                }`}
                style={{
                  backgroundColor: assigned
                    ? colorMap[sid % nColor]
                    : 'rgb(229, 231, 235)',
                }}
                onMouseEnter={(e) => {
                  hlAnimation(pid, 'start');
                }}
                onMouseLeave={(e) => {
                  hlAnimation(pid, 'stop');
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (
                    !multiPids &&
                    (!selectedPids.includes(pid) || selectedPids.length)
                  )
                    selectPids([pid]);
                  if (multiPids)
                    selectPids(
                      selectedPids.includes(pid)
                        ? selectedPids.filter((p) => p !== pid)
                        : [...selectedPids, pid]
                    );
                }}
                onDoubleClick={(e) => toggleVis(pid)}
                onContextMenu={(e) => unassign(pid)}
              >
                {sid !== -1 && <span>{sid}</span>}
                {selected && (
                  <div className='ra-absolute -ra-bottom-7 ra-flex ra-flex-col ra-justify-between ra-items-center -ra-space-y-0.5'>
                    <span className='ra-w-2 ra-h-2 ra-rounded-full ra-bg-indigo-600'></span>
                    <span className='ra-font-extrabold ra-text-xs ra-text-indigo-600'>
                      {idxOfSelected + 1}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const useKeypointsComponents = () => {
  const operationPanel = OperationPanel();

  return { KeypointsStructure: operationPanel };
};
