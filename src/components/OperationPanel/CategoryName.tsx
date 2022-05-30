import React, { useState } from 'react';
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

  const [inputValue, setInputValue] = useState<string>(categoryName);
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  const rename = () => {
    if (!inputValue || inputValue === categoryName) setInputValue(categoryName);
    else renameCategory(categoryName, inputValue);
  };

  const handleKeyPress = (event: React.KeyboardEvent) =>
    event.key === 'Enter' && rename();

  return (
    <div className='pb-1 static w-full flex justify-end'>
      <input
        className='w-full truncate bg-transparent text-center px-0.5'
        type='text'
        tabIndex={-1}
        value={inputValue}
        onInput={handleInput}
        onChange={() => {}}
        onBlur={rename}
        disabled={!isSelected(categoryName)}
        onClick={(e) => e.stopPropagation()}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};
