import React, { MouseEventHandler } from 'react';

const Icon =
  (children: React.ReactNode) =>
  ({
    onClick,
    className,
  }: {
    onClick?: MouseEventHandler;
    className?: string;
  }) =>
    (
      <div onClick={onClick} className={className}>
        {children}
      </div>
    );

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
);

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
);

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
);

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
);

export const PolylineIcon = Icon(
  <svg
    className='h-5 w-5'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='0.2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <g clipPath='url(#clip0_1345_6662)'>
      <path
        d='M7.812 2.64001C6.15888 2.64001 4.8 3.99865 4.8 5.65201C4.8 6.58489 5.23248 7.42321 5.9064 7.97713L3.47544 12.9999C3.32232 12.9744 3.16745 12.9611 3.01224 12.96C1.3584 12.96 0 14.3187 0 15.972C0 17.6256 1.35864 18.984 3.012 18.984C4.60848 18.984 5.91744 17.7149 6.0072 16.1395C6.01838 16.0845 6.02401 16.0284 6.024 15.9723C6.02401 15.9161 6.01838 15.86 6.0072 15.805C5.96016 14.9791 5.57592 14.2397 4.9932 13.7208L7.45176 8.64001C7.57032 8.65441 7.69008 8.66401 7.81224 8.66401C8.91936 8.66401 9.88752 8.05297 10.4071 7.15321L14.6808 8.28289C14.905 9.68569 16.1088 10.7751 17.5613 10.8192L19.2427 15.9447C18.4925 16.4943 18 17.3789 18 18.372C18 20.0256 19.3586 21.384 21.012 21.384C22.6085 21.384 23.9174 20.1149 24.0072 18.5395C24.0184 18.4845 24.024 18.4284 24.024 18.3723C24.024 18.3161 24.0184 18.26 24.0072 18.205C23.9172 16.6296 22.6082 15.36 21.012 15.36C20.9482 15.36 20.8855 15.3653 20.8224 15.3696L19.1892 10.3913C20.0174 9.88969 20.5889 9.00001 20.647 7.97953C20.6581 7.92448 20.6638 7.86844 20.6638 7.81225C20.6638 7.75607 20.6581 7.70003 20.647 7.64497C20.5574 6.06961 19.2485 4.80001 17.6522 4.80001C16.4282 4.80001 15.3677 5.54545 14.8982 6.60289L10.8134 5.52289C10.8116 5.51021 10.8094 5.49756 10.807 5.48497C10.7174 3.90961 9.40848 2.64001 7.81224 2.64001H7.812ZM7.812 4.32001C8.55768 4.32001 9.144 4.90657 9.144 5.65201C9.144 6.39769 8.55768 6.98401 7.812 6.98401C7.06656 6.98401 6.48 6.39769 6.48 5.65201C6.48 4.90657 7.06656 4.32001 7.812 4.32001ZM17.652 6.48001C18.3977 6.48001 18.984 7.06657 18.984 7.81201C18.984 8.55769 18.3977 9.14401 17.652 9.14401C16.9066 9.14401 16.32 8.55769 16.32 7.81201C16.32 7.06657 16.9066 6.48001 17.652 6.48001V6.48001ZM3.012 14.64C3.75768 14.64 4.344 15.2266 4.344 15.972C4.344 16.7177 3.75768 17.304 3.012 17.304C2.2668 17.304 1.68 16.7177 1.68 15.972C1.68 15.2268 2.26656 14.64 3.012 14.64V14.64ZM21.012 17.04C21.7577 17.04 22.344 17.6266 22.344 18.372C22.344 19.1177 21.7577 19.704 21.012 19.704C20.2666 19.704 19.68 19.1177 19.68 18.372C19.68 17.6266 20.2666 17.04 21.012 17.04Z'
        fill='currentColor'
      />
    </g>
  </svg>
);

export const PolygonIcon = Icon(
  <svg
    className='h-5 w-5'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <polygon points='12 2 22 9.27 18.18 21.02 5.82 21.02 2 9.27 12 2' />
  </svg>
);

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
);

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
);

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
);

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
);

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
);

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
);

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
);

export const VisibleIcon = Icon(
  <svg
    className='h-5 w-5'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='2'
  >
    <path d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
    <path d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
  </svg>
);

export const InvisibleIcon = Icon(
  <svg
    className='h-5 w-5'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='2'
  >
    <path d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' />
  </svg>
);

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
);

export const SpinnerIcon = Icon(
  <svg
    role='status'
    className='w-8 h-8 mr-2 text-gray-200 animate-spin'
    style={{ fill: '#1E90FF' }}
    viewBox='0 0 100 101'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
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

export const WarningIcon = Icon(
  <svg
    className='w-10 h-10 fill-current text-red-500 '
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
  >
    <path d='M0 0h24v24H0V0z' fill='none' />
    <path d='M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z' />
  </svg>
);

export const AIIcon = Icon(
  <svg
    className='h-6 w-6'
    viewBox='0 0 24 24'
    strokeWidth='1'
    stroke='currentColor'
    fill='currentColor'
  >
    <text y='17' x='5'>
      AI
    </text>
  </svg>
);

export const checkImg =
  'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAABgAAAAYBAMAAAASWSDLAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAACRQTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAplgCRwAAAAx0Uk5TABbMw9P/yhXS1xgZuie7XQAAAEJJREFUeJxjYAADRmUGBBAJQ7DZW2chOBWRCwhIGAkwMLo6QkVTHRlEQgTgSrYjdDC6usAlgPaFOsLZDIxKCIlBDAD0FgwW5ZrsFgAAAABJRU5ErkJggg==';
