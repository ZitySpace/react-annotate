import React from 'react';

export const CategoryName = ({ categoryName }: { categoryName: string }) => {
  return (
    <div className='pb-1 static w-full flex justify-end'>
      <span className='w-full truncate bg-transparent text-left pb-2 font-semibold'>
        {categoryName}
      </span>
    </div>
  );
};
