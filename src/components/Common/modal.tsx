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
          title_bg: 'ra-bg-green-100',
          title_text: 'ra-text-green-500',
          btn_bg: 'ra-bg-green-500',
          hover_btn_bg: 'hover:ra-bg-green-600',
          focus_btn_bg: 'focus:ra-ring-green-500',
        }
      : type === 'warning' || type === 'error'
      ? {
          title_bg: 'ra-bg-red-100',
          title_text: 'ra-text-red-500',
          btn_bg: 'ra-bg-red-500',
          hover_btn_bg: 'hover:ra-bg-red-600',
          focus_btn_bg: 'focus:ra-ring-red-500',
        }
      : {
          title_bg: 'ra-bg-indigo-100',
          title_text: 'ra-text-indigo-500',
          btn_bg: 'ra-bg-indigo-500',
          hover_btn_bg: 'hover:ra-bg-indigo-600',
          focus_btn_bg: 'focus:ra-ring-indigo-500',
        };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as='div'
        static
        className='ra-fixed ra-z-40 ra-inset-0 ra-overflow-y-auto'
        initialFocus={cancelButtonRef}
        open={open}
        onClose={canCancel ? onClose : () => {}}
      >
        <div className='ra-flex ra-items-center ra-justify-center ra-h-screen ra-py-4 ra-px-4 ra-text-center sm:ra-block sm:ra-p-0'>
          <Transition.Child
            as={Fragment}
            enter='ra-ease-out ra-duration-300'
            enterFrom='ra-opacity-0'
            enterTo='ra-opacity-100'
            leave='ra-ease-in ra-duration-200'
            leaveFrom='ra-opacity-100'
            leaveTo='ra-opacity-0'
          >
            <Dialog.Overlay className='ra-fixed ra-inset-0 ra-bg-gray-500 ra-bg-opacity-75 ra-transition-opacity' />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className='ra-hidden sm:ra-inline-block sm:ra-align-middle sm:ra-h-screen'
            aria-hidden='true'
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter='ra-ease-out ra-duration-300'
            enterFrom='ra-opacity-0 ra-translate-y-4 sm:ra-translate-y-0 sm:ra-scale-95'
            enterTo='ra-opacity-100 ra-translate-y-0 sm:ra-scale-100'
            leave='ra-ease-in ra-duration-200'
            leaveFrom='ra-opacity-100 ra-translate-y-0 sm:ra-scale-100'
            leaveTo='ra-opacity-0 ra-translate-y-4 sm:ra-translate-y-0 sm:ra-scale-95'
          >
            <div className='ra-inline-block ra-align-bottom ra-bg-white ra-rounded-lg ra-text-left ra-overflow-hidden ra-shadow-xl ra-transform ra-transition-all sm:ra-my-8 sm:ra-align-middle sm:ra-max-w-lg'>
              {children ? (
                children
              ) : (
                <div className='ra-bg-white ra-px-4 ra-pt-5 ra-pb-4 sm:ra-p-6 sm:ra-pb-4'>
                  <div className='sm:ra-flex sm:ra-items-start'>
                    <div
                      className={`ra-mx-auto ra-flex-shrink-0 ra-flex ra-items-center ra-justify-center ra-h-12 ra-w-12 ra-rounded-full ${colors.title_bg} sm:ra-mx-0 sm:ra-h-10 sm:ra-w-10`}
                    >
                      {type === 'success' ? (
                        <CheckCircleIcon
                          className={`ra-h-6 ra-w-6 ${colors.title_text}`}
                          aria-hidden='true'
                        />
                      ) : (
                        <ExclamationCircleIcon
                          className={`ra-h-6 ra-w-6 ${colors.title_text}`}
                          aria-hidden='true'
                        />
                      )}
                    </div>
                    <div className='ra-mt-3 ra-text-center sm:ra-mt-0 sm:ra-ml-4 sm:ra-text-left'>
                      <Dialog.Title
                        as='h3'
                        className='ra-text-lg ra-leading-6 ra-font-medium ra-text-gray-900'
                      >
                        {title}
                      </Dialog.Title>
                      <div className='ra-mt-2'>
                        <p className='ra-text-sm ra-text-gray-500'>{body}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className='ra-bg-gray-50 ra-px-4 ra-py-3 sm:ra-px-6 sm:ra-flex sm:ra-flex-row-reverse'>
                {canConfirm ? (
                  <button
                    type='button'
                    className={`ra-w-full ra-inline-flex ra-justify-center ra-rounded-md ra-border ra-border-transparent ra-shadow-sm ra-px-4 ra-py-2 ${colors.btn_bg} ra-text-base ra-font-medium ra-text-white ${colors.hover_btn_bg} focus:ra-outline-none focus:ra-ring-2 focus:ra-ring-offset-2 ${colors.focus_btn_bg} sm:ra-ml-3 sm:ra-w-auto sm:ra-text-sm`}
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
                    className='ra-mt-3 ra-w-full ra-inline-flex ra-justify-center ra-rounded-md ra-border ra-border-gray-300 ra-shadow-sm ra-px-4 ra-py-2 ra-bg-white ra-text-base ra-font-medium ra-text-gray-700 hover:ra-bg-gray-50 focus:ra-outline-none focus:ra-ring-2 focus:ra-ring-offset-2 focus:ra-ring-indigo-500 sm:ra-mt-0 sm:ra-ml-3 sm:ra-w-auto sm:ra-text-sm'
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
