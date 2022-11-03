import React, { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationCircleIcon, CheckCircleIcon } from '../Icons';

export type ModalProps = {
  children?: React.ReactNode;
  title: string;
  body: string;
  open: boolean;
  setOpen: Function;
  yesCallback: Function;
  confirmAlias?: string;
  type?: 'warning' | 'success' | 'error' | 'default';
  canCancel?: boolean;
  canConfirm?: boolean;
};

export const Modal = ({
  title,
  body,
  open,
  setOpen,
  yesCallback,
  confirmAlias = 'Confirm',
  type = 'warning',
  canCancel = true,
  canConfirm = true,
  children,
}: ModalProps) => {
  const onClose = () => setOpen(false);
  const cancelButtonRef = useRef(null);

  const colors =
    type === 'success'
      ? {
          title_bg: 'bg-green-100',
          title_text: 'text-green-500',
          btn_bg: 'bg-green-500',
          hover_btn_bg: 'hover:bg-green-600',
          focus_btn_bg: 'focus:ring-green-500',
        }
      : type === 'warning' || type === 'error'
      ? {
          title_bg: 'bg-red-100',
          title_text: 'text-red-500',
          btn_bg: 'bg-red-500',
          hover_btn_bg: 'hover:bg-red-600',
          focus_btn_bg: 'focus:ring-red-500',
        }
      : {
          title_bg: 'bg-indigo-100',
          title_text: 'text-indigo-500',
          btn_bg: 'bg-indigo-500',
          hover_btn_bg: 'hover:bg-indigo-600',
          focus_btn_bg: 'focus:ring-indigo-500',
        };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as='div'
        static
        className='fixed z-40 inset-0 overflow-y-auto'
        initialFocus={cancelButtonRef}
        open={open}
        onClose={canCancel ? onClose : () => {}}
      >
        <div className='flex items-center justify-center h-screen py-4 px-4 text-center sm:block sm:p-0'>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <Dialog.Overlay className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className='hidden sm:inline-block sm:align-middle sm:h-screen'
            aria-hidden='true'
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            enterTo='opacity-100 translate-y-0 sm:scale-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100 translate-y-0 sm:scale-100'
            leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
          >
            <div className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg'>
              {children ? (
                children
              ) : (
                <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
                  <div className='sm:flex sm:items-start'>
                    <div
                      className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${colors.title_bg} sm:mx-0 sm:h-10 sm:w-10`}
                    >
                      {type === 'success' ? (
                        <CheckCircleIcon
                          className={`h-6 w-6 ${colors.title_text}`}
                          aria-hidden='true'
                        />
                      ) : (
                        <ExclamationCircleIcon
                          className={`h-6 w-6 ${colors.title_text}`}
                          aria-hidden='true'
                        />
                      )}
                    </div>
                    <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
                      <Dialog.Title
                        as='h3'
                        className='text-lg leading-6 font-medium text-gray-900'
                      >
                        {title}
                      </Dialog.Title>
                      <div className='mt-2'>
                        <p className='text-sm text-gray-500'>{body}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
                {canConfirm ? (
                  <button
                    type='button'
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${colors.btn_bg} text-base font-medium text-white ${colors.hover_btn_bg} focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.focus_btn_bg} sm:ml-3 sm:w-auto sm:text-sm`}
                    onClick={async () => {
                      const res = await yesCallback();
                      setOpen(res == undefined ? false : !res);
                    }}
                  >
                    {confirmAlias}
                  </button>
                ) : null}
                {canCancel ? (
                  <button
                    type='button'
                    className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'
                    onClick={onClose}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
