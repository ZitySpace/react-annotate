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
    const isFocused = isSelected(anno.id);
    const newLabels = multi
      ? selectedLabels.filter(({ id }: { id: number }) => id !== anno.id)
      : [];

    if (isFocused) selectLabels(newLabels);
    else selectLabels([...newLabels, anno]);
  };

  return (
    <div className='grid grid-cols-4 gap-1 mr-0.5 flex-row-reverse'>
      {annotations.map((anno, index) => (
        <div
          key={anno.id}
          className={`h-5 w-5 rounded-md flex justify-center items-center border border-transparent hover:border-indigo-600
            ${
              isSelected(anno.id)
                ? 'bg-indigo-600 text-gray-100'
                : 'bg-gray-200'
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
