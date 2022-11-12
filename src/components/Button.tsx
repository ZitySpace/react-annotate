import React from 'react';

export const Button = ({
  children,
  canUse = true,
  isUsing = false,
  onClick,
}: {
  children: any;
  canUse?: boolean;
  isUsing?: boolean;
  onClick: (event: any) => void;
}) => {
  const defaultCls =
    'ra-h-6 ra-w-6 ra-rounded-sm md:ra-h-8 md:ra-w-8 md:ra-rounded-full ra-flex ra-justify-center ra-items-center ra-bg-gray-200 ra-cursor-pointer';
  const textClass = isUsing
    ? 'ra-text-gray-100'
    : canUse
    ? 'hover:ra-text-gray-100'
    : 'ra-text-gray-400';
  const bgClass = isUsing
    ? 'ra-bg-indigo-600 '
    : canUse
    ? 'hover:ra-bg-indigo-600'
    : '';

  const click = (event: any) => {
    canUse && onClick(event);
  };
  return (
    <div onClick={click} className={`${defaultCls} ${textClass} ${bgClass}`}>
      {children}
    </div>
  );
};
