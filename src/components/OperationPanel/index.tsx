import React, { MouseEvent } from 'react';
import Draggable from 'react-draggable';
import { Label } from '../../classes/Label';
import { UseColorsReturnProps } from '../../hooks/useColor';
import { UseFocusReturnProps } from '../../hooks/useFocus';
import { MultipleSelectIcon } from '../Icons';
import { AnnotationsGrid } from './AnnotationsGrid';
import { CategoryName } from './CategoryName';
import { groupBy } from '../../utils';
import { useStore } from 'zustand';
import { CanvasStore, CanvasStoreProps } from '../../stores/CanvasStore';

export const OperationPanel = ({
  focus,
  annoColors,
}: {
  focus: UseFocusReturnProps;
  annoColors: UseColorsReturnProps;
}) => {
  const {
    nowFocus: { isMultipleSelectionMode, objects },
    isFocused,
    setObjects,
    toggleSelectionMode,
  } = focus;

  const [labels, renameCategory] = useStore(
    CanvasStore,
    (s: CanvasStoreProps) => [
      s.curState() ? groupBy(s.curState(), 'category') : [],
      (oldName: string, newName: string) => {
        s.renameCategory(oldName, newName);
        annoColors.rename(oldName, newName);
      },
    ]
  );

  const handleClick = (e: MouseEvent) => {
    const annotations: Label[] = JSON.parse(
      e.currentTarget['dataset']['annotations']
    );

    const isAllFocused = annotations.every(isFocused);
    const newObjects = isMultipleSelectionMode
      ? objects.filter(
          ({ id }) => !annotations.map(({ id }) => id).includes(id)
        )
      : [];
    setObjects(newObjects.concat(isAllFocused ? [] : annotations));
  };

  return (
    <div className='absolute w-full h-full pb-7 md:pb-9 invisible'>
      <div className='relative h-full p-2 overflow-hidden'>
        <Draggable
          bounds='parent'
          handle='.cate_handle'
          cancel='.selbar-state-icon'
        >
          <div className='bg-gray-100 bg-opacity-0 absolute bottom-2 right-2 visible max-h-full w-34 flex flex-col items-end text-xs select-none'>
            <div className='bg-indigo-400 py-2 px-2 w-28 rounded-t-md flex justify-between cate_handle'>
              <span className='mx-auto'> Category </span>
              <MultipleSelectIcon
                className={`text-indigo-200 ${
                  isMultipleSelectionMode ? 'text-indigo-600' : ''
                }`}
                onClick={toggleSelectionMode}
              />
            </div>

            <div className='h-full w-full overflow-y-auto'>
              {labels.map(([categoryName, annotations]: [string, Label[]]) => (
                <div className='flex flex-row' key={categoryName}>
                  <div
                    className='w-28 p-2 flex flex-col items-end border-indigo-600'
                    style={{
                      backgroundColor: annoColors.get(categoryName),
                    }}
                    data-annotations={JSON.stringify(annotations)}
                    onClick={handleClick}
                  >
                    <CategoryName
                      categoryName={categoryName}
                      focus={focus}
                      renameCategory={renameCategory}
                    />
                    <AnnotationsGrid annotations={annotations} focus={focus} />
                  </div>
                </div>
              ))}
              {/* <div
                onClick={addCategory}
                className='text-gray-700 hover:bg-indigo-600 hover:text-white'
              >
                <PlusSmIcon className='w-5 h-5 m-auto' />
              </div> */}
            </div>
          </div>
        </Draggable>
      </div>
    </div>
  );
};
