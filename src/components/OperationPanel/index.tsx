import React, { MouseEvent, useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Label } from '../../labels';
import {
  SquaresIcon,
  CogIcon,
  TagIcon,
  TrashIcon,
  CloseIcon,
  CheckIcon,
  ArrowRightIcon,
  MultipleSelectIcon,
} from '../Icons';
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
import { Modal, ModalProps } from '../Common/modal';

export const OperationPanel = ({
  onAddCategory,
  onRenameCategory,
}: {
  onAddCategory: (category: string) => boolean;
  onRenameCategory: (oldCategory: string, newCategory: string) => boolean;
}) => {
  const {
    multi,
    labels: selectedLabels,
    isSelected,
    selectLabels,
    toggleMulti,
    category: selectedCategory,
    categories: categoriesInStore,
    setCategories: setCategoriesInStore,
  } = useStore(SelectionStore, (s: SelectionStoreProps) => s);

  const {
    colors,
    getColor,
    renameKey: renameColorKey,
  } = useStore(ColorStore, (s: ColorStoreProps) => s);

  const [getCurState, groupedAnnos, assignCategory, renameCategory] = useStore(
    CanvasStore,
    (s: CanvasStoreProps) => [
      s.curState,
      s.curState() ? groupBy(s.curState(), 'category') : [],
      s.assignCategory,
      (oldName: string, newName: string) => {
        s.renameCategory(oldName, newName);
        renameColorKey(oldName, newName);
      },
    ]
  );

  const [catePicking, setCatePicking] = useState<boolean>(false);
  const [cateRenaming, setCateRenaming] = useState<boolean>(false);
  const [cateInput, setCateInput] = useState<string>('');
  const [renameInput, setRenameInput] = useState<string>('');
  const [cateHovered, setCateHovered] = useState<string>('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const [modalConfig, setModalConfig] = useState<ModalProps>({
    title: '',
    body: '',
    open: false,
    setOpen: (open: boolean) => setModalConfig({ ...modalConfig, open }),
    yesCallback: () => {},
  });

  const openModal = (cfg: {
    title?: string;
    body?: string;
    yesCallback?: Function;
    confirmAlias?: string;
    type?: 'warning' | 'success' | 'error' | 'default';
    canCancel?: boolean;
    canConfirm?: boolean;
  }) => {
    const cfg_ = { ...modalConfig, ...cfg };
    setModalConfig({
      ...cfg_,
      open: true,
      setOpen: (open: boolean) => setModalConfig({ ...cfg_, open }),
    });
  };

  const handleClick = (e: MouseEvent) => {
    const annotations: Label[] = JSON.parse(
      e.currentTarget['dataset']['annotations']
    );

    const allSelected = annotations.every((label) => isSelected(label.id));
    const newLabels = multi
      ? selectedLabels.filter(
          ({ id }: { id: number }) =>
            !annotations.map(({ id }) => id).includes(id)
        )
      : [];
    selectLabels(newLabels.concat(allSelected ? [] : annotations));
  };

  const updateSelectedToCategory = (cate: string) => {
    const ids = selectedLabels.map((l) => l.id);
    if (!assignCategory(ids, cate)) return;
    const curState = getCurState();
    selectLabels(curState.filter((label) => ids.includes(label.id)));
  };

  useEffect(() => {
    setCateInput('');
    selectedLabels.length && setCateRenaming(false);
  }, [selectedLabels]);

  return (
    <div className='absolute w-full h-full pb-9 invisible'>
      <div className='relative h-full p-2 overflow-hidden'>
        <Draggable bounds='parent' handle='#sel_handle'>
          <div className='bg-gray-100 w-28 bg-opacity-0 absolute top-2 right-2 visible max-h-full flex flex-col items-end text-xs select-none'>
            <div
              id='sel_handle'
              className='bg-indigo-400 py-2 px-2 w-full rounded-t-md flex justify-between hover:cursor-grab'
            >
              <span className='w-full text-left font-semibold'>Category</span>
              <div
                className={`text-indigo-200 hover:cursor-pointer ${
                  multi ? 'text-indigo-600' : ''
                }`}
                onClick={toggleMulti}
              >
                <MultipleSelectIcon />
              </div>
            </div>

            <div className='h-full w-full overflow-y-auto'>
              {groupedAnnos.map(
                ([categoryName, annotations]: [string, Label[]]) => (
                  <div className='flex flex-row relative' key={categoryName}>
                    <div
                      className='w-28 p-2 flex flex-col'
                      style={{
                        backgroundColor: getColor(categoryName),
                      }}
                      data-annotations={JSON.stringify(annotations)}
                      onClick={handleClick}
                    >
                      <CategoryName categoryName={categoryName} />
                      <AnnotationsGrid annotations={annotations} />
                    </div>

                    {categoryName === selectedCategory && (
                      <span className='absolute right-0 h-full w-1 bg-indigo-600'></span>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </Draggable>

        <Draggable bounds='parent' handle='#edit_handle'>
          <div
            className='bg-gray-100 bg-opacity-0 absolute top-2 visible max-h-full flex flex-col text-xs select-none'
            onMouseLeave={() => {
              setCatePicking(false);
              editInputRef.current?.blur();
            }}
          >
            <div className='flex'>
              <div
                id='edit_handle'
                className='relative inline-flex items-center rounded-l-md bg-indigo-400 p-2 text-indigo-200 hover:cursor-grab'
              >
                <SquaresIcon />
              </div>

              <div className='relative flex '>
                <span className='absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-indigo-200'>
                  <TagIcon />
                </span>
                <input
                  type='text'
                  className={`border-0 pl-10 text-xs font-semibold focus:outline-none ${
                    cateRenaming ? 'w-32' : 'pr-10 rounded-r-md w-80'
                  }`}
                  ref={editInputRef}
                  placeholder={selectedCategory || ''}
                  value={cateInput}
                  onChange={(e) => setCateInput(e.target.value)}
                  onMouseEnter={() => {
                    setCatePicking(true);
                    editInputRef.current?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (
                      selectedLabels.length &&
                      cateInput &&
                      e.key === 'Enter'
                    ) {
                      e.preventDefault();
                      e.stopPropagation();

                      if (categoriesInStore?.includes(cateInput))
                        updateSelectedToCategory(cateInput);
                      else
                        openModal({
                          type: 'warning',
                          title: 'Confirm',
                          body: 'Add a new category and assign selected objects with the new category?',
                          yesCallback: () => {
                            if (!onAddCategory(cateInput)) return;
                            updateSelectedToCategory(cateInput);
                          },
                        });
                    }
                  }}
                />

                {cateRenaming ? (
                  <div
                    className='pr-2 flex items-center bg-white rounded-r-md'
                    onMouseEnter={() => setCatePicking(false)}
                  >
                    <span
                      className={`px-1  ${
                        categoriesInStore?.includes(cateInput)
                          ? 'text-indigo-600'
                          : 'text-indigo-200'
                      }`}
                    >
                      <ArrowRightIcon onClick={() => {}} />
                    </span>

                    <input
                      type='text'
                      className='border-0 text-xs font-semibold focus:outline-none w-20'
                      value={renameInput}
                      onChange={(e) => setRenameInput(e.target.value)}
                    />

                    <span
                      className={`px-1  ${
                        categoriesInStore?.includes(cateInput)
                          ? 'text-indigo-600 hover:cursor-pointer'
                          : 'text-indigo-200 hover:cursor-not-allowed'
                      }`}
                    >
                      <TrashIcon onClick={() => {}} />
                    </span>

                    <span
                      className={`px-1  ${
                        categoriesInStore?.includes(cateInput) &&
                        renameInput !== ''
                          ? 'text-indigo-600 hover:cursor-pointer'
                          : 'text-indigo-200 hover:cursor-not-allowed'
                      }`}
                    >
                      <CheckIcon onClick={() => {}} />
                    </span>

                    <span className='px-1 text-indigo-600 hover:cursor-pointer'>
                      <CloseIcon
                        onClick={() => {
                          setCateRenaming(false);
                          setCateInput('');
                        }}
                      />
                    </span>
                  </div>
                ) : (
                  <div className='absolute inset-y-0 right-0 pr-2 flex items-center '>
                    <span
                      className={`${
                        selectedCategory
                          ? 'text-indigo-200 hover:cursor-not-allowed'
                          : 'text-indigo-600 hover:cursor-pointer'
                      }  `}
                    >
                      <CogIcon
                        onClick={() => {
                          if (!selectedCategory) setCateRenaming(true);
                        }}
                      />
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`bg-gray-100 mt-1 p-2 rounded-md max-w-md h-64 overflow-auto ${
                catePicking ? '' : 'hidden'
              }`}
            >
              <div className='flex flex-wrap max-h-full'>
                {(categoriesInStore || [])
                  .filter(
                    (cate) => cateInput === '' || cate.startsWith(cateInput)
                  )
                  .map((cate) => (
                    <span
                      key={cate}
                      className={`px-2 py-1 border-2 rounded-md m-1 text-xs font-semibold text-center ${
                        cate === selectedCategory || cate === cateHovered
                          ? 'text-white'
                          : ''
                      }`}
                      style={
                        cate === selectedCategory
                          ? {
                              backgroundColor: getColor(cate),
                              borderColor: getColor(cate),
                            }
                          : cate === cateHovered
                          ? {
                              backgroundColor: colors.hasOwnProperty(cate)
                                ? getColor(cate)
                                : 'gray',
                              borderColor: colors.hasOwnProperty(cate)
                                ? getColor(cate)
                                : 'gray',
                            }
                          : {
                              borderColor: colors.hasOwnProperty(cate)
                                ? getColor(cate)
                                : 'gray',
                            }
                      }
                      onMouseEnter={() => setCateHovered(cate)}
                      onMouseLeave={() => setCateHovered('')}
                      onClick={() => {
                        if (selectedCategory) updateSelectedToCategory(cate);

                        if (cateRenaming) {
                          setCateInput(cate);
                        }
                      }}
                    >
                      {cate}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </Draggable>
      </div>

      <Modal {...modalConfig} />
    </div>
  );
};
