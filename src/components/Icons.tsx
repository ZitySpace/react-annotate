import React, { MouseEventHandler } from 'react'

const Icon =
  (children: React.ReactNode) =>
  ({
    onClick,
    className
  }: {
    onClick?: MouseEventHandler
    className?: string
  }) =>
    (
      <div onClick={onClick} className={className}>
        {children}
      </div>
    )

export const SaveIcon = Icon(
  <svg
    className='h-5 w-5'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' />
    <polyline points='17 21 17 13 7 13 7 21' />
    <polyline points='7 3 7 8 15 8' />
  </svg>
)

export const PointIcon = Icon(
  <svg
    className='h-5 w-5'
    viewBox='0 0 24 24'
    strokeWidth='2'
    stroke='currentColor'
    fill='none'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path stroke='none' d='M0 0h24v24H0z' />
    <circle cx='12' cy='12' r='.5' fill='currentColor' />
    <circle cx='12' cy='12' r='9' />
  </svg>
)

export const RectangleIcon = Icon(
  <svg
    className='h-6 w-6'
    viewBox='0 0 24 24'
    strokeWidth='2'
    stroke='currentColor'
    fill='none'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path stroke='none' d='M0 0h24v24H0z' />
    <rect x='4' y='6' width='16' height='12' rx='2' />
  </svg>
)

export const LineIcon = Icon(
  <svg
    className='h-5 w-5'
    viewBox='0 0 24 24'
    strokeWidth='2'
    stroke='currentColor'
    fill='none'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path stroke='none' d='M0 0h24v24H0z' />
    <circle cx='6' cy='6' r='2' />
    <circle cx='18' cy='18' r='2' />
    <line x1='7.5' y1='7.5' x2='16.5' y2='16.5' />
  </svg>
)

export const UndoIcon = Icon(
  <svg
    className='h-5 w-5 transform rotate-45'
    viewBox='0 0 24 24'
    strokeWidth='2'
    stroke='currentColor'
    fill='none'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path stroke='none' d='M0 0h24v24H0z' />
    <path d='M15 4.55a8 8 0 0 0 -6 14.9m0 -4.45v5h-5' />
    <path d='M13 19.95a8 8 0 0 0 5.3 -12.8' strokeDasharray='.001 4.13' />
  </svg>
)

export const RedoIcon = Icon(
  <svg
    className='h-5 w-5 transform -rotate-45'
    viewBox='0 0 24 24'
    strokeWidth='2'
    stroke='currentColor'
    fill='none'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path stroke='none' d='M0 0h24v24H0z' />
    <path d='M9 4.55a8 8 0 0 1 6 14.9m0 -4.45v5h5' />
    <path d='M11 19.95a8 8 0 0 1 -5.3 -12.8' strokeDasharray='.001 4.13' />
  </svg>
)

export const ResetIcon = Icon(
  <svg
    className='h-4 w-4'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <polyline points='23 4 23 10 17 10' />
    <polyline points='1 20 1 14 7 14' />
    <path d='M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' />
  </svg>
)

export const NextIcon = Icon(
  <svg
    className='h-5 w-5'
    viewBox='0 0 24 24'
    strokeWidth='2'
    stroke='currentColor'
    fill='none'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path stroke='none' d='M0 0h24v24H0z' />
    <polyline points='9 6 15 12 9 18' />
  </svg>
)

export const PervIcon = Icon(
  <svg
    className='h-5 w-5'
    viewBox='0 0 24 24'
    strokeWidth='2'
    stroke='currentColor'
    fill='none'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path stroke='none' d='M0 0h24v24H0z' />
    <polyline points='15 6 9 12 15 18' />
  </svg>
)

export const TrashIcon = Icon(
  <svg
    className='h-5 w-5'
    viewBox='0 0 24 24'
    strokeWidth='2'
    stroke='currentColor'
    fill='none'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path stroke='none' d='M0 0h24v24H0z' />
    <line x1='4' y1='7' x2='20' y2='7' />
    <line x1='10' y1='11' x2='10' y2='17' />
    <line x1='14' y1='11' x2='14' y2='17' />
    <path d='M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12' />
    <path d='M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3' />
  </svg>
)

export const CloseIcon = Icon(
  <svg
    className='h-5 w-5'
    viewBox='0 0 24 24'
    strokeWidth='2'
    stroke='currentColor'
    strokeLinecap='round'
    fill='none'
    strokeLinejoin='round'
  >
    <path stroke='none' d='M0 0h24v24H0z' />
    <line x1='18' y1='6' x2='6' y2='18' />
    <line x1='6' y1='6' x2='18' y2='18' />
  </svg>
)

export const MultipleSelectIcon = Icon(
  <svg
    className='h-4 w-4'
    viewBox='0 0 24 24'
    strokeWidth='2'
    stroke='currentColor'
    fill='none'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path stroke='none' d='M0 0h24v24H0z' />
    <polyline points='9 11 12 14 20 6' />
    <path d='M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9' />
  </svg>
)

export const ListIcon = Icon(
  <svg
    className='h-4 w-4'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M4 6h16M4 12h16M4 18h16'
    />
  </svg>
)

export const GridIcon = Icon(
  <svg
    className='h-4 w-4'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
    />
  </svg>
)
