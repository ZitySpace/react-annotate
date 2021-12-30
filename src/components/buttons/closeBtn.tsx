import { XIcon } from '@heroicons/react/solid'
import React from 'react'

export const CloseButton = ({ onClick }: { onClick: (event: any) => void }) => {
  return (
    <div className='flex justify-center space-x-1 absolute bottom-0 left-1 md:left-1/4'>
      <div
        onClick={onClick}
        className='h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer hover:bg-indigo-600 hover:text-gray-100'
      >
        <XIcon className='h-4 w-4' />
      </div>
    </div>
  )
}
