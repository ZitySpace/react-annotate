import React, { useEffect, useRef } from 'react';
import { useStore } from 'zustand';
import {
  SelectionStore,
  SelectionStoreProps,
} from '../../stores/SelectionStore';

export const CategoryName = ({
  categoryName,
  renameCategory,
}: {
  categoryName: string;
  renameCategory: Function;
}) => {
  const isSelected = useStore(
    SelectionStore,
    (s: SelectionStoreProps) => s.isSelected
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const rename = () => {
    const inputEle = inputRef.current;
    if (!inputEle) return;
    if (!inputEle.value) inputEle.value = categoryName;
    else renameCategory(categoryName, inputEle.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent) =>
    event.key === 'Enter' && rename();

  useEffect(() => {
    inputRef.current?.addEventListener('blur', () => rename());
  }, [inputRef]);

  return (
    <div className='pb-1 static w-full flex justify-end'>
      <input
        className='w-full truncate bg-transparent text-center px-0.5'
        type='text'
        ref={inputRef}
        defaultValue={categoryName}
        disabled={!isSelected(categoryName)}
        onClick={(e) => e.stopPropagation()}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};
