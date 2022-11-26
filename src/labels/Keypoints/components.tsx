import React, { useEffect } from 'react';
import { useStore } from 'zustand';
import { KeypointsStore, KeypointsStoreProps } from './store';
import {
  KeypointsLabel,
  keypointsLabelConfig as cfg,
  colorMap,
  nColor,
} from './label';
import { LabelType } from '../Base';
import {
  SelectionStore,
  SelectionStoreProps,
} from '../../stores/SelectionStore';
import { CanvasStore, CanvasStoreProps } from '../../stores/CanvasStore';
import { getLocalTimeISOString } from '../utils';

const OperationPanel = () => {
  const [curState, pushState] = useStore(CanvasStore, (s: CanvasStoreProps) => [
    s.curState(),
    s.pushState,
  ]);
  const { labels: selectedLabels, selectLabels } = useStore(
    SelectionStore,
    (s: SelectionStoreProps) => s
  );

  const { pids: selectedPids, setPids: selectPids } = useStore(
    KeypointsStore,
    (s: KeypointsStoreProps) => s
  );

  const { structure } = cfg;
  const sids = [...new Set<number>(structure.flat())].sort((a, b) => a - b);

  const hasKeypointsLabel = curState.some(
    (s) => s.labelType === LabelType.Keypoints
  );
  const disabled =
    selectedLabels.length !== 1 ||
    selectedLabels[0].labelType !== LabelType.Keypoints;

  const pidsInfo: { [key: number]: { sid: number; vis: boolean } } = {};
  const sidsInfo: { [key: number]: { pid: number; vis: boolean } } = {};
  if (!disabled) {
    (selectedLabels[0] as KeypointsLabel).keypoints.forEach((p) => {
      pidsInfo[p.pid!] = { sid: p.sid, vis: p.vis };
      if (p.sid !== -1) sidsInfo[p.sid] = { pid: p.pid!, vis: p.vis };
    });
  }

  return (
    <div
      className={`${
        hasKeypointsLabel ? 'ra-visible' : ''
      } ra-bg-gray-100 ra-bg-opacity-0 ra-absolute ra-bottom-2 ra-left-2 ra-max-h-full ra-flex ra-flex-col ra-text-xs ra-select-none`}
    >
      <div
        id='KeypointsStructure'
        className='ra-bg-indigo-400 ra-p-2 ra-w-full ra-rounded-t-md hover:ra-cursor-grab ra-text-left ra-font-semibold'
      >
        Keypoints
      </div>

      <div
        className={`${
          disabled
            ? 'ra-bg-indigo-200 ra-pointer-events-none ra-text-gray-400'
            : 'ra-bg-indigo-300'
        } ra-px-2 ra-pt-2 ra-pb-4 ra-flex ra-flex-col ra-space-y-2`}
      >
        <span className='ra-py-1 ra-font-semibold'>Skeleton</span>

        <div className='ra-grid ra-grid-cols-6 ra-gap-4 ra-flex-row-reverse'>
          {sids.map((sid, i) => {
            const assigned = sidsInfo.hasOwnProperty(sid);
            const vis = assigned && sidsInfo[sid].vis;
            const selected =
              assigned && selectedPids.includes(sidsInfo[sid].pid);

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
                onClick={(e) => {}}
              >
                <span>{sid}</span>
                {selected && (
                  <div className='ra-w-2 ra-h-2 ra-absolute ra-rounded-full -ra-bottom-3.5 ra-bg-indigo-600'></div>
                )}
              </div>
            );
          })}
        </div>

        <span
          className={`ra-pb-1 ra-pt-3 ra-font-semibold ${
            disabled ? 'hidden' : ''
          }`}
        >
          Keypoints
        </span>

        <div className='ra-grid ra-grid-cols-6 ra-gap-4 ra-flex-row-reverse'>
          {Object.entries(pidsInfo)
            .sort(([pid1, info1], [pid2, info2]) => {
              const sid1 = info1.sid;
              const sid2 = info2.sid;

              if (sid1 === sid2) return Number(pid1) - Number(pid2);
              if (sid1 === -1) return 1;
              if (sid2 === -1) return -1;
              return sid1 - sid2;
            })
            .map(([pid_, info], i) => {
              const pid = Number(pid_);
              const { vis, sid } = info;
              const assigned = sidsInfo.hasOwnProperty(sid);
              const selected = selectedPids.includes(pid);

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
                  onClick={(e) => {
                    selectPids([pid]);
                  }}
                  onDoubleClick={(e) => {
                    if (!selected) return;

                    const newState = curState.map((label) => label.clone());
                    const now = getLocalTimeISOString();
                    newState.forEach((label) => {
                      if (label.id === selectedLabels[0].id) {
                        label.timestamp = now;
                        (label as KeypointsLabel).keypoints.forEach((p) => {
                          if (p.sid === sid && p.pid === pid) p.vis = !p.vis;
                        });
                      }
                    });
                    pushState(newState);
                    selectLabels(
                      newState.filter(
                        (label) => label.id === selectedLabels[0].id
                      )
                    );
                  }}
                >
                  {sid !== -1 && <span>{sid}</span>}
                  {selected && (
                    <div className='ra-w-2 ra-h-2 ra-absolute ra-rounded-full -ra-bottom-3.5 ra-bg-indigo-600'></div>
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
