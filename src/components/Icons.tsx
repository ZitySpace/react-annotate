import React from 'react';

export const SaveIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-5 w-5'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <path d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' />
    <polyline points='17 21 17 13 7 13 7 21' />
    <polyline points='7 3 7 8 15 8' />
  </svg>
);

export const EditIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-6 w-6'
    viewBox='0 0 24 24'
    fill='currentColor'
    {...props}
  >
    <path d='M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z' />
  </svg>
);

export const TagIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='w-6 h-6'
    viewBox='0 0 24 24'
    fill='currentColor'
    {...props}
  >
    <path
      fillRule='evenodd'
      d='M5.25 2.25a3 3 0 00-3 3v4.318a3 3 0 00.879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 005.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 00-2.122-.879H5.25zM6.375 7.5a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z'
      clipRule='evenodd'
    />
  </svg>
);

export const CogIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='w-6 h-6'
    viewBox='0 0 24 24'
    fill='currentColor'
    {...props}
  >
    <path d='M17.004 10.407c.138.435-.216.842-.672.842h-3.465a.75.75 0 01-.65-.375l-1.732-3c-.229-.396-.053-.907.393-1.004a5.252 5.252 0 016.126 3.537zM8.12 8.464c.307-.338.838-.235 1.066.16l1.732 3a.75.75 0 010 .75l-1.732 3.001c-.229.396-.76.498-1.067.16A5.231 5.231 0 016.75 12c0-1.362.519-2.603 1.37-3.536zM10.878 17.13c-.447-.097-.623-.608-.394-1.003l1.733-3.003a.75.75 0 01.65-.375h3.465c.457 0 .81.408.672.843a5.252 5.252 0 01-6.126 3.538z' />
    <path
      fillRule='evenodd'
      d='M21 12.75a.75.75 0 000-1.5h-.783a8.22 8.22 0 00-.237-1.357l.734-.267a.75.75 0 10-.513-1.41l-.735.268a8.24 8.24 0 00-.689-1.191l.6-.504a.75.75 0 10-.964-1.149l-.6.504a8.3 8.3 0 00-1.054-.885l.391-.678a.75.75 0 10-1.299-.75l-.39.677a8.188 8.188 0 00-1.295-.471l.136-.77a.75.75 0 00-1.477-.26l-.136.77a8.364 8.364 0 00-1.377 0l-.136-.77a.75.75 0 10-1.477.26l.136.77c-.448.121-.88.28-1.294.47l-.39-.676a.75.75 0 00-1.3.75l.392.678a8.29 8.29 0 00-1.054.885l-.6-.504a.75.75 0 00-.965 1.149l.6.503a8.243 8.243 0 00-.689 1.192L3.8 8.217a.75.75 0 10-.513 1.41l.735.267a8.222 8.222 0 00-.238 1.355h-.783a.75.75 0 000 1.5h.783c.042.464.122.917.238 1.356l-.735.268a.75.75 0 10.513 1.41l.735-.268c.197.417.428.816.69 1.192l-.6.504a.75.75 0 10.963 1.149l.601-.505c.326.323.679.62 1.054.885l-.392.68a.75.75 0 101.3.75l.39-.679c.414.192.847.35 1.294.471l-.136.771a.75.75 0 101.477.26l.137-.772a8.376 8.376 0 001.376 0l.136.773a.75.75 0 101.477-.26l-.136-.772a8.19 8.19 0 001.294-.47l.391.677a.75.75 0 101.3-.75l-.393-.679a8.282 8.282 0 001.054-.885l.601.504a.75.75 0 10.964-1.15l-.6-.503a8.24 8.24 0 00.69-1.191l.735.268a.75.75 0 10.512-1.41l-.734-.268c.115-.438.195-.892.237-1.356h.784zm-2.657-3.06a6.744 6.744 0 00-1.19-2.053 6.784 6.784 0 00-1.82-1.51A6.704 6.704 0 0012 5.25a6.801 6.801 0 00-1.225.111 6.7 6.7 0 00-2.15.792 6.784 6.784 0 00-2.952 3.489.758.758 0 01-.036.099A6.74 6.74 0 005.251 12a6.739 6.739 0 003.355 5.835l.01.006.01.005a6.706 6.706 0 002.203.802c.007 0 .014.002.021.004a6.792 6.792 0 002.301 0l.022-.004a6.707 6.707 0 002.228-.816 6.781 6.781 0 001.762-1.483l.009-.01.009-.012a6.744 6.744 0 001.18-2.064c.253-.708.39-1.47.39-2.264a6.74 6.74 0 00-.408-2.308z'
      clipRule='evenodd'
    />
  </svg>
);

export const SquaresIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='w-6 h-6'
    viewBox='0 0 24 24'
    fill='currentColor'
    {...props}
  >
    <path
      fillRule='evenodd'
      d='M3 6a3 3 0 013-3h2.25a3 3 0 013 3v2.25a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm9.75 0a3 3 0 013-3H18a3 3 0 013 3v2.25a3 3 0 01-3 3h-2.25a3 3 0 01-3-3V6zM3 15.75a3 3 0 013-3h2.25a3 3 0 013 3V18a3 3 0 01-3 3H6a3 3 0 01-3-3v-2.25zm9.75 0a3 3 0 013-3H18a3 3 0 013 3V18a3 3 0 01-3 3h-2.25a3 3 0 01-3-3v-2.25z'
      clipRule='evenodd'
    />
  </svg>
);

export const PointIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-5 w-5'
    viewBox='0 0 24 24'
    strokeWidth='2'
    stroke='currentColor'
    fill='none'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <path stroke='none' d='M0 0h24v24H0z' />
    <circle cx='12' cy='12' r='.5' fill='currentColor' />
    <circle cx='12' cy='12' r='9' />
  </svg>
);

export const RectangleIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-6 w-6'
    viewBox='0 0 24 24'
    strokeWidth='2'
    stroke='currentColor'
    fill='none'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <path stroke='none' d='M0 0h24v24H0z' />
    <rect x='4' y='6' width='16' height='12' rx='2' />
  </svg>
);

export const LineIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-5 w-5'
    viewBox='0 0 24 24'
    strokeWidth='2'
    stroke='currentColor'
    fill='none'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <path stroke='none' d='M0 0h24v24H0z' />
    <circle cx='6' cy='6' r='2' />
    <circle cx='18' cy='18' r='2' />
    <line x1='7.5' y1='7.5' x2='16.5' y2='16.5' />
  </svg>
);

export const PolylineIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-5 w-5'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='0.2'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <g clipPath='url(#clip0_1345_6662)'>
      <path
        d='M7.812 2.64001C6.15888 2.64001 4.8 3.99865 4.8 5.65201C4.8 6.58489 5.23248 7.42321 5.9064 7.97713L3.47544 12.9999C3.32232 12.9744 3.16745 12.9611 3.01224 12.96C1.3584 12.96 0 14.3187 0 15.972C0 17.6256 1.35864 18.984 3.012 18.984C4.60848 18.984 5.91744 17.7149 6.0072 16.1395C6.01838 16.0845 6.02401 16.0284 6.024 15.9723C6.02401 15.9161 6.01838 15.86 6.0072 15.805C5.96016 14.9791 5.57592 14.2397 4.9932 13.7208L7.45176 8.64001C7.57032 8.65441 7.69008 8.66401 7.81224 8.66401C8.91936 8.66401 9.88752 8.05297 10.4071 7.15321L14.6808 8.28289C14.905 9.68569 16.1088 10.7751 17.5613 10.8192L19.2427 15.9447C18.4925 16.4943 18 17.3789 18 18.372C18 20.0256 19.3586 21.384 21.012 21.384C22.6085 21.384 23.9174 20.1149 24.0072 18.5395C24.0184 18.4845 24.024 18.4284 24.024 18.3723C24.024 18.3161 24.0184 18.26 24.0072 18.205C23.9172 16.6296 22.6082 15.36 21.012 15.36C20.9482 15.36 20.8855 15.3653 20.8224 15.3696L19.1892 10.3913C20.0174 9.88969 20.5889 9.00001 20.647 7.97953C20.6581 7.92448 20.6638 7.86844 20.6638 7.81225C20.6638 7.75607 20.6581 7.70003 20.647 7.64497C20.5574 6.06961 19.2485 4.80001 17.6522 4.80001C16.4282 4.80001 15.3677 5.54545 14.8982 6.60289L10.8134 5.52289C10.8116 5.51021 10.8094 5.49756 10.807 5.48497C10.7174 3.90961 9.40848 2.64001 7.81224 2.64001H7.812ZM7.812 4.32001C8.55768 4.32001 9.144 4.90657 9.144 5.65201C9.144 6.39769 8.55768 6.98401 7.812 6.98401C7.06656 6.98401 6.48 6.39769 6.48 5.65201C6.48 4.90657 7.06656 4.32001 7.812 4.32001ZM17.652 6.48001C18.3977 6.48001 18.984 7.06657 18.984 7.81201C18.984 8.55769 18.3977 9.14401 17.652 9.14401C16.9066 9.14401 16.32 8.55769 16.32 7.81201C16.32 7.06657 16.9066 6.48001 17.652 6.48001V6.48001ZM3.012 14.64C3.75768 14.64 4.344 15.2266 4.344 15.972C4.344 16.7177 3.75768 17.304 3.012 17.304C2.2668 17.304 1.68 16.7177 1.68 15.972C1.68 15.2268 2.26656 14.64 3.012 14.64V14.64ZM21.012 17.04C21.7577 17.04 22.344 17.6266 22.344 18.372C22.344 19.1177 21.7577 19.704 21.012 19.704C20.2666 19.704 19.68 19.1177 19.68 18.372C19.68 17.6266 20.2666 17.04 21.012 17.04Z'
        fill='currentColor'
      />
    </g>
  </svg>
);

export const PolygonIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-5 w-5'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <polygon points='12 2 22 9.27 18.18 21.02 5.82 21.02 2 9.27 12 2' />
  </svg>
);

export const UndoIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-5 w-5 transform rotate-45'
    viewBox='0 0 24 24'
    strokeWidth='2'
    stroke='currentColor'
    fill='none'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <path stroke='none' d='M0 0h24v24H0z' />
    <path d='M15 4.55a8 8 0 0 0 -6 14.9m0 -4.45v5h-5' />
    <path d='M13 19.95a8 8 0 0 0 5.3 -12.8' strokeDasharray='.001 4.13' />
  </svg>
);

export const RedoIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-5 w-5 transform -rotate-45'
    viewBox='0 0 24 24'
    strokeWidth='2'
    stroke='currentColor'
    fill='none'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <path stroke='none' d='M0 0h24v24H0z' />
    <path d='M9 4.55a8 8 0 0 1 6 14.9m0 -4.45v5h5' />
    <path d='M11 19.95a8 8 0 0 1 -5.3 -12.8' strokeDasharray='.001 4.13' />
  </svg>
);

export const ResetIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-4 w-4'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <polyline points='23 4 23 10 17 10' />
    <polyline points='1 20 1 14 7 14' />
    <path d='M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' />
  </svg>
);

export const NextIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-5 w-5'
    viewBox='0 0 24 24'
    strokeWidth='2'
    stroke='currentColor'
    fill='none'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <path stroke='none' d='M0 0h24v24H0z' />
    <polyline points='9 6 15 12 9 18' />
  </svg>
);

export const PervIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-5 w-5'
    viewBox='0 0 24 24'
    strokeWidth='2'
    stroke='currentColor'
    fill='none'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <path stroke='none' d='M0 0h24v24H0z' />
    <polyline points='15 6 9 12 15 18' />
  </svg>
);

export const TrashIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-5 w-5'
    viewBox='0 0 24 24'
    strokeWidth='2'
    stroke='currentColor'
    fill='none'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <path stroke='none' d='M0 0h24v24H0z' />
    <line x1='4' y1='7' x2='20' y2='7' />
    <line x1='10' y1='11' x2='10' y2='17' />
    <line x1='14' y1='11' x2='14' y2='17' />
    <path d='M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12' />
    <path d='M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3' />
  </svg>
);

export const CloseIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-5 w-5'
    viewBox='0 0 24 24'
    strokeWidth='2'
    stroke='currentColor'
    strokeLinecap='round'
    fill='none'
    strokeLinejoin='round'
    {...props}
  >
    <path stroke='none' d='M0 0h24v24H0z' />
    <line x1='18' y1='6' x2='6' y2='18' />
    <line x1='6' y1='6' x2='18' y2='18' />
  </svg>
);

export const CheckIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='w-6 h-6'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth='1.5'
    stroke='currentColor'
    {...props}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M4.5 12.75l6 6 9-13.5'
    />
  </svg>
);

export const CheckCircleIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='w-6 h-6'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth='1.5'
    stroke='currentColor'
    {...props}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    />
  </svg>
);

export const ExclamationCircleIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='w-6 h-6'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth='1.5'
    stroke='currentColor'
    {...props}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z'
    />
  </svg>
);

export const ArrowRightIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='w-6 h-6'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth='1.5'
    stroke='currentColor'
    {...props}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    />
  </svg>
);

export const VisibleIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-5 w-5'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='2'
    {...props}
  >
    <path d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
    <path d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
  </svg>
);

export const InvisibleIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-5 w-5'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='2'
    {...props}
  >
    <path d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' />
  </svg>
);

export const MultipleSelectIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-5 w-5'
    viewBox='0 0 24 24'
    strokeWidth='2'
    stroke='currentColor'
    fill='none'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <path stroke='none' d='M0 0h24v24H0z' />
    <polyline points='9 11 12 14 20 6' />
    <path d='M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9' />
  </svg>
);

export const SpinnerIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='w-8 h-8 mr-2 text-gray-200 animate-spin'
    viewBox='0 0 100 101'
    fill='#1E90FF'
    {...props}
  >
    <path
      d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
      fill='currentColor'
    />
    <path
      d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
      fill='currentFill'
    />
  </svg>
);

export const WarningIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='w-10 h-10 fill-current text-red-500 '
    viewBox='0 0 24 24'
    {...props}
  >
    <path d='M0 0h24v24H0V0z' fill='none' />
    <path d='M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z' />
  </svg>
);

export const AIIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-6 w-6'
    viewBox='0 0 24 24'
    strokeWidth='1'
    stroke='currentColor'
    fill='currentColor'
    {...props}
  >
    <text y='17' x='5'>
      AI
    </text>
  </svg>
);

export const checkImg =
  'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAABgAAAAYBAMAAAASWSDLAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAACRQTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAplgCRwAAAAx0Uk5TABbMw9P/yhXS1xgZuie7XQAAAEJJREFUeJxjYAADRmUGBBAJQ7DZW2chOBWRCwhIGAkwMLo6QkVTHRlEQgTgSrYjdDC6usAlgPaFOsLZDIxKCIlBDAD0FgwW5ZrsFgAAAABJRU5ErkJggg==';
