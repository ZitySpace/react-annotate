import React from 'react';
import { useStore } from 'zustand';
import { Label } from '../../labels';
import {
  SelectionStore,
  SelectionStoreProps,
} from '../../stores/SelectionStore';

export const AnnotationsGrid = ({ annotations }: { annotations: Label[] }) => {
  const {
    multi,
    labels: selectedLabels,
    isSelected,
    selectLabels,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const annoIndex = e.currentTarget['dataset']['annoIndex'];
    const anno = annotations[annoIndex];
    const selected = isSelected(anno.id);
    const newLabels = multi
      ? selectedLabels.filter(({ id }: { id: number }) => id !== anno.id)
      : [];

    if (selected) selectLabels(newLabels);
    else selectLabels([...newLabels, anno]);
  };

  return (
    <div className='ra-grid ra-grid-cols-4 ra-gap-1 ra-mr-0.5 ra-flex-row-reverse'>
      {annotations.map((anno, index) => (
        <div
          key={anno.id}
          className={`ra-h-5 ra-w-5 ra-rounded-md ra-flex ra-justify-center ra-items-center ra-border ra-border-transparent hover:ra-border-indigo-600
            ${
              isSelected(anno.id)
                ? 'ra-bg-indigo-600 ra-text-gray-100'
                : 'ra-bg-gray-200'
            }`}
          data-anno-index={index}
          onClick={handleClick}
        >
          <span>{anno.id}</span>
        </div>
      ))}
    </div>
  );
};
