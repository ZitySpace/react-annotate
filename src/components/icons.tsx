import React from 'react'

export const HeavyFloppyIcon = () => {
  return (
    <div className='h-full flex items-center justify-center font-extralight'>
      <svg
        className='h-3 w-3 fill-current'
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 295 295'
      >
        <g>
          <path
            d='M257.666,0.5H38C17.197,0.5,0,17.364,0,38.167v218.666C0,277.636,17.197,294.5,38,294.5h9.833H247.5h10.166
	c20.803,0,37.334-16.864,37.334-37.667V38.167C295,17.364,278.469,0.5,257.666,0.5z M231,31.5v68H63v-68H231z M232,264.5H62v-84h170
	V264.5z M97,81.5H81v-33h16V81.5z M213,213.5H81v-16h132V213.5z M213,246.5H81v-16h132V246.5z'
          />
        </g>
      </svg>
    </div>
  )
}

export const PointIcon = () => {
  return (
    <div>
      <svg
        className='h-5 w-5'
        width='24'
        height='24'
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
    </div>
  )
}

export const RectangleIcon = () => {
  return (
    <div>
      <svg
        className='h-6 w-6'
        width='24'
        height='24'
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
    </div>
  )
}

export const LineIcon = () => {
  return (
    <div>
      <svg
        className='h-5 w-5'
        width='24'
        height='24'
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
    </div>
  )
}

export const UndoIcon = () => {
  return (
    <div>
      <svg
        className='h-5 w-5 transform rotate-45'
        width='24'
        height='24'
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
    </div>
  )
}

export const RedoIcon = () => {
  return (
    <div>
      <svg
        className='h-5 w-5 transform -rotate-45'
        width='24'
        height='24'
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
    </div>
  )
}

export const ResetIcon = () => {
  return (
    <div>
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
    </div>
  )
}
