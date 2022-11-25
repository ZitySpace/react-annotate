import React, { useEffect } from 'react';
import { useStore } from 'zustand';
import { KeypointsStore, KeypointsStoreProps } from './store';
import {
  KeypointsLabel,
  keypointsLabelConfig as cfg,
  colorMap,
  nColor,
} from './label';
import { setup } from '../listeners/setup';
import { LabelType } from '../Base';

const OperationPanel = () => {
  const { curState, selectedLabels } = setup();

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
  if (!disabled)
    (selectedLabels[0] as KeypointsLabel).keypoints.forEach((p) => {
      pidsInfo[p.pid!] = { sid: p.sid, vis: p.vis };
      if (p.sid !== -1) sidsInfo[p.sid] = { pid: p.pid!, vis: p.vis };
    });

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
        Structure
      </div>

      <div
        className={`${
          disabled
            ? 'ra-bg-indigo-200 ra-pointer-events-none ra-text-gray-400'
            : 'ra-bg-indigo-300'
        } ra-p-2 ra-flex ra-flex-col ra-space-y-2`}
      >
        <span className='ra-py-1'>Structure</span>

        <div className='ra-grid ra-grid-cols-6 ra-gap-3 ra-flex-row-reverse'>
          {sids.map((sid, i) => {
            const assigned = sidsInfo.hasOwnProperty(sid);
            const vis = assigned && sidsInfo[sid].vis;
            const selected =
              assigned && selectedPids.includes(sidsInfo[sid].pid);

            return (
              <div
                key={sid}
                className={`ra-w-6 ra-h-6 ra-rounded-full ra-flex ra-justify-center ra-items-center ${
                  assigned
                    ? 'ra-text-gray-100 ' +
                      (vis
                        ? ''
                        : 'ra-border-2 ra-border-black ra-border-opacity-75')
                    : ''
                } ${
                  selected
                    ? 'ra-ring-offset-4 ra-ring-2 ra-ring-offset-indigo-300 ra-ring-indigo-700'
                    : ''
                } `}
                style={{
                  backgroundColor: assigned
                    ? colorMap[sid % nColor]
                    : 'rgb(229, 231, 235)',
                }}
              >
                <span>{sid}</span>
              </div>
            );
          })}
        </div>

        <span className='ra-py-1'>Unassigned</span>

        <div className='ra-grid ra-grid-cols-6 ra-gap-3 ra-flex-row-reverse'>
          {Object.entries(pidsInfo)
            .filter(([_, info]) => info.sid === -1)
            .map(([pid_, info], i) => {
              const pid = Number(pid_);
              const selected = selectedPids.includes(pid);

              return (
                <div
                  key={i}
                  className={`ra-w-6 ra-h-6 ra-rounded-full ra-flex ra-justify-center ra-items-center ra-bg-gray-200 ${
                    info.vis
                      ? ''
                      : 'ra-border-2 ra-border-black ra-border-opacity-75'
                  } ${
                    selected
                      ? 'ra-ring-offset-4 ra-ring-2 ra-ring-offset-indigo-300 ra-ring-indigo-700'
                      : ''
                  }`}
                ></div>
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
