import React, { MouseEvent } from 'react';
import Draggable from 'react-draggable';
import { Label } from '../../classes/Label';
import { MultipleSelectIcon } from '../Icons';
import { AnnotationsGrid } from './AnnotationsGrid';
import { CategoryName } from './CategoryName';
import { groupBy } from '../../utils';
import { useStore } from 'zustand';
import { CanvasStore, CanvasStoreProps } from '../../stores/CanvasStore';
import {
  SelectionStore,
  SelectionStoreProps,
} from '../../stores/SelectionStore';
import { ColorStore, ColorStoreProps } from '../../stores/ColorStore';

export const OperationPanel = () => {
  const {
    multi,
    objects: selectedObjects,
    isSelected,
    selectObjects,
    toggleMulti,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  const { getColor, renameKey: renameColorKey } = useStore(
    ColorStore,
    (s: ColorStoreProps) => s
  );

  const [labels, renameCategory] = useStore(
    CanvasStore,
    (s: CanvasStoreProps) => [
      s.curState() ? groupBy(s.curState(), 'category') : [],
      (oldName: string, newName: string) => {
        s.renameCategory(oldName, newName);
        renameColorKey(oldName, newName);
      },
    ]
  );

  const handleClick = (e: MouseEvent) => {
    const annotations: Label[] = JSON.parse(
      e.currentTarget['dataset']['annotations']
    );

    const isAllFocused = annotations.every((label) => isSelected(label.id));
    const newObjects = multi
      ? selectedObjects.filter(
          ({ id }: { id: number }) =>
            !annotations.map(({ id }) => id).includes(id)
        )
      : [];
    selectObjects(newObjects.concat(isAllFocused ? [] : annotations));
  };

  return (
    <div className='absolute w-full h-full pb-9 invisible'>
      <div className='relative h-full p-2 overflow-hidden'>
        <Draggable
          bounds='parent'
          handle='.cate_handle'
          cancel='.selbar-state-icon'
        >
          <div className='bg-gray-100 w-28 bg-opacity-0 absolute top-2 right-2 visible max-h-full w-34 flex flex-col items-end text-xs select-none'>
            <div className='bg-indigo-400 py-2 px-2 w-full rounded-t-md flex justify-between cate_handle'>
              <span className='mx-auto'> Category </span>
              <MultipleSelectIcon
                className={`text-indigo-200 ${multi ? 'text-indigo-600' : ''}`}
                onClick={toggleMulti}
              />
            </div>

            <div className='h-full w-full overflow-y-auto'>
              {labels.map(([categoryName, annotations]: [string, Label[]]) => (
                <div className='flex flex-row' key={categoryName}>
                  <div
                    className='w-28 p-2 flex flex-col items-end border-indigo-600'
                    style={{
                      backgroundColor: getColor(categoryName),
                    }}
                    data-annotations={JSON.stringify(annotations)}
                    onClick={handleClick}
                  >
                    <CategoryName
                      categoryName={categoryName}
                      renameCategory={renameCategory}
                    />
                    <AnnotationsGrid annotations={annotations} />
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
