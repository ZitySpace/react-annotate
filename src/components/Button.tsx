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
    'h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer';
  const textClass = isUsing
    ? 'text-gray-100'
    : canUse
    ? 'hover:text-gray-100'
    : 'text-gray-400';
  const bgClass = isUsing
    ? 'bg-indigo-600 '
    : canUse
    ? 'hover:bg-indigo-600'
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
