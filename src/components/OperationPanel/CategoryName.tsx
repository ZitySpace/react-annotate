import React from 'react';

export const CategoryName = ({ categoryName }: { categoryName: string }) => {
  return (
    <div className='ra-pb-1 ra-static ra-w-full ra-flex ra-justify-end'>
      <span className='ra-w-full ra-truncate ra-bg-transparent ra-text-left ra-pb-2 ra-font-semibold'>
        {categoryName}
      </span>
    </div>
  );
};
