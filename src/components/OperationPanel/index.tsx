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
import { groupBy, placeAtLast } from '../../utils';
import { useStore } from 'zustand';
import shallow from 'zustand/shallow';
import { CanvasStore, CanvasStoreProps } from '../../stores/CanvasStore';
import {
  SelectionStore,
  SelectionStoreProps,
} from '../../stores/SelectionStore';
import { ColorStore, ColorStoreProps } from '../../stores/ColorStore';
import { Modal, ModalProps } from '../Common/modal';
import { LabeledImageData } from '../../interfaces/basic';
import { getLocalTimeISOString } from '../../labels/utils';
import { UNKNOWN_CATEGORY_NAME } from '../../labels/config';

export const OperationPanel = ({
  imagesList,
  onAddCategory,
  onRenameCategory,
}: {
  imagesList: LabeledImageData[];
  onAddCategory: (category: string) => Promise<boolean> | boolean;
  onRenameCategory: (
    oldCategory: string,
    newCategory: string,
    timestamp?: string
  ) => Promise<boolean> | boolean;
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

  const [hasColorKey, getColor, renameColorKey] = useStore(
    ColorStore,
    (s: ColorStoreProps) => [s.hasKey, s.getColor, s.renameKey],
    shallow
  );

  const [getCurState, groupedAnnos, assignCategory, setStack, updateCanSave] =
    useStore(CanvasStore, (s: CanvasStoreProps) => [
      s.curState,
      s.curState() ? groupBy(s.curState(), 'category') : [],
      s.assignCategory,
      s.setStack,
      s.updateCanSave,
    ]);

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

  const renameCategory = (
    oldCate: string,
    newCate: string,
    timestamp?: string
  ) => {
    const renamedCurState = getCurState().map((l_) => {
      const l = l_.clone();
      if (l.category === oldCate) l.category = newCate;
      return l;
    });

    const now = timestamp || getLocalTimeISOString();
    imagesList.forEach((d) =>
      d.annotations.forEach((l) => {
        if (l.category === oldCate) {
          l.category = newCate;
          l.timestamp = now;
        }
      })
    );

    renameColorKey(oldCate, newCate);
    setStack([renamedCurState]);
    updateCanSave(true);
    setCateInput('');
    setRenameInput('');
    setCateRenaming(false);
  };

  useEffect(() => {
    setCateInput('');
    selectedLabels.length && setCateRenaming(false);
  }, [selectedLabels]);

  return (
    <div className='ra-absolute ra-w-full ra-h-full ra-pb-9 ra-invisible'>
      <div className='ra-relative ra-h-full ra-p-2 ra-overflow-hidden'>
        <Draggable bounds='parent' handle='#sel_handle'>
          <div className='ra-bg-gray-100 ra-w-28 ra-bg-opacity-0 ra-absolute ra-top-2 ra-right-2 ra-visible ra-max-h-full ra-flex ra-flex-col ra-items-end ra-text-xs ra-select-none'>
            <div
              id='sel_handle'
              className='ra-bg-indigo-400 ra-py-2 ra-px-2 ra-w-full ra-rounded-t-md ra-flex ra-justify-between hover:ra-cursor-grab'
            >
              <span className='ra-w-full ra-text-left ra-font-semibold'>
                Category
              </span>
              <div
                className={`ra-text-indigo-200 hover:ra-cursor-pointer ${
                  multi ? 'ra-text-indigo-600' : ''
                }`}
                onClick={toggleMulti}
              >
                <MultipleSelectIcon />
              </div>
            </div>

            <div className='ra-h-full ra-w-full ra-overflow-y-auto'>
              {groupedAnnos.map(
                ([categoryName, annotations]: [string, Label[]]) => (
                  <div
                    className='ra-flex ra-flex-row ra-relative'
                    key={categoryName}
                  >
                    <div
                      className='ra-w-28 ra-p-2 ra-flex ra-flex-col'
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
                      <span className='ra-absolute ra-right-0 ra-h-full ra-w-1 ra-bg-indigo-600'></span>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </Draggable>

        <Draggable bounds='parent' handle='#edit_handle'>
          <div
            className='ra-bg-gray-100 ra-bg-opacity-0 ra-absolute ra-top-2 ra-visible ra-max-h-full ra-flex ra-flex-col ra-text-xs ra-select-none'
            onMouseLeave={() => {
              setCatePicking(false);
              editInputRef.current?.blur();
            }}
          >
            <div className='ra-flex'>
              <div
                id='edit_handle'
                className='ra-relative ra-inline-flex ra-items-center ra-rounded-l-md ra-bg-indigo-400 ra-p-2 ra-text-indigo-200 hover:ra-cursor-grab'
              >
                <SquaresIcon />
              </div>

              <div className='ra-relative ra-flex '>
                <span className='ra-absolute ra-inset-y-0 ra-left-0 ra-pl-2 ra-flex ra-items-center ra-pointer-events-none ra-text-indigo-200'>
                  <TagIcon />
                </span>
                <input
                  type='text'
                  className={`ra-border-0 ra-pl-10 ra-text-xs ra-font-semibold focus:ra-outline-none ${
                    cateRenaming
                      ? 'ra-w-32'
                      : 'ra-pr-10 ra-rounded-r-md ra-w-40'
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
                          yesCallback: async () => {
                            if (!(await onAddCategory(cateInput))) return;
                            updateSelectedToCategory(cateInput);
                            setCategoriesInStore(
                              placeAtLast(
                                [...(categoriesInStore || []), cateInput],
                                UNKNOWN_CATEGORY_NAME
                              )
                            );
                          },
                        });
                    }
                  }}
                />

                {cateRenaming ? (
                  <div
                    className='ra-pr-2 ra-flex ra-items-center ra-bg-white ra-rounded-r-md'
                    onMouseEnter={() => setCatePicking(false)}
                  >
                    <span
                      className={`ra-px-1  ${
                        categoriesInStore?.includes(cateInput)
                          ? 'ra-text-indigo-600'
                          : 'ra-text-indigo-200'
                      }`}
                    >
                      <ArrowRightIcon onClick={() => {}} />
                    </span>

                    <input
                      type='text'
                      className='ra-border-0 ra-text-xs ra-font-semibold focus:ra-outline-none ra-w-20'
                      value={renameInput}
                      onChange={(e) => setRenameInput(e.target.value)}
                    />

                    <span
                      className={`ra-px-1  ${
                        categoriesInStore?.includes(cateInput)
                          ? 'ra-text-indigo-600 hover:ra-cursor-pointer'
                          : 'ra-text-indigo-200 hover:ra-cursor-not-allowed'
                      }`}
                    >
                      <TrashIcon
                        onClick={() => {
                          if (
                            !categoriesInStore?.includes(cateInput) ||
                            cateInput === UNKNOWN_CATEGORY_NAME
                          )
                            return;

                          openModal({
                            type: 'warning',
                            title: 'Confirm',
                            body: `Delete category "${cateInput}"? Labels of "${cateInput}" will be updated to ${UNKNOWN_CATEGORY_NAME}.`,
                            yesCallback: async () => {
                              const now = getLocalTimeISOString();

                              if (
                                !(await onRenameCategory(
                                  cateInput,
                                  UNKNOWN_CATEGORY_NAME,
                                  now
                                ))
                              )
                                return;

                              renameCategory(
                                cateInput,
                                UNKNOWN_CATEGORY_NAME,
                                now
                              );
                              setCategoriesInStore(
                                placeAtLast(
                                  (categoriesInStore || []).filter(
                                    (c) => c !== cateInput
                                  ),
                                  UNKNOWN_CATEGORY_NAME
                                )
                              );
                            },
                          });
                        }}
                      />
                    </span>

                    <span
                      className={`ra-px-1  ${
                        categoriesInStore?.includes(cateInput) &&
                        renameInput !== ''
                          ? 'ra-text-indigo-600 hover:ra-cursor-pointer'
                          : 'ra-text-indigo-200 hover:ra-cursor-not-allowed'
                      }`}
                    >
                      <CheckIcon
                        onClick={() => {
                          if (
                            !(
                              categoriesInStore?.includes(cateInput) &&
                              renameInput !== '' &&
                              cateInput !== renameInput
                            )
                          )
                            return;

                          openModal({
                            type: 'warning',
                            title: 'Confirm',
                            body: `${
                              categoriesInStore.includes(renameInput)
                                ? 'Merge'
                                : 'Rename'
                            } category "${cateInput}" to "${renameInput}"?`,
                            yesCallback: async () => {
                              const now = getLocalTimeISOString();

                              if (
                                !(await onRenameCategory(
                                  cateInput,
                                  renameInput,
                                  now
                                ))
                              )
                                return;

                              renameCategory(cateInput, renameInput, now);
                              setCategoriesInStore(
                                placeAtLast(
                                  [
                                    ...(categoriesInStore || []).filter(
                                      (c) => c !== cateInput
                                    ),
                                    renameInput,
                                  ],
                                  UNKNOWN_CATEGORY_NAME
                                )
                              );
                            },
                          });
                        }}
                      />
                    </span>

                    <span className='ra-px-1 ra-text-indigo-600 hover:ra-cursor-pointer'>
                      <CloseIcon
                        onClick={() => {
                          setCateRenaming(false);
                          setCateInput('');
                          setRenameInput('');
                        }}
                      />
                    </span>
                  </div>
                ) : (
                  <div className='ra-absolute ra-inset-y-0 ra-right-0 ra-pr-2 ra-flex ra-items-center '>
                    <span
                      className={`${
                        selectedCategory
                          ? 'ra-text-indigo-200 hover:ra-cursor-not-allowed'
                          : 'ra-text-indigo-600 hover:ra-cursor-pointer'
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
              className={`ra-bg-gray-100 ra-mt-1 ra-p-2 ra-rounded-md ra-max-w-md ra-h-64 ra-overflow-auto ${
                catePicking ? '' : 'ra-hidden'
              }`}
            >
              <div className='ra-flex ra-flex-wrap ra-max-h-full'>
                {(categoriesInStore || [])
                  .filter(
                    (cate) => cateInput === '' || cate.startsWith(cateInput)
                  )
                  .map((cate) => (
                    <span
                      key={cate}
                      className={`ra-px-2 ra-py-1 ra-border-2 ra-rounded-md ra-m-1 ra-text-xs ra-font-semibold ra-text-center ${
                        cate === selectedCategory || cate === cateHovered
                          ? 'ra-text-white'
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
                              backgroundColor: hasColorKey(cate)
                                ? getColor(cate)
                                : 'gray',
                              borderColor: hasColorKey(cate)
                                ? getColor(cate)
                                : 'gray',
                            }
                          : {
                              borderColor: hasColorKey(cate)
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
