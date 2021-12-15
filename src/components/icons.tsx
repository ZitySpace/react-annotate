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
