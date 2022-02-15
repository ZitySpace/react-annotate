import React, { useState } from 'react'
import { useKey } from 'react-use'

export const CategoryName = ({
  categoryName,
  panelType,
  focus,
  renameCategory
}: {
  categoryName: string
  panelType: number
  focus: boolean
  renameCategory: Function
}) => {
  console.log(categoryName)

  const [inputValue, setInputValue] = useState<string>(categoryName)
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
    console.log(inputValue)
  }
  const rename = () => {
    if (!inputValue || inputValue === categoryName) setInputValue(categoryName)
    else renameCategory(categoryName, inputValue)
  }

  useKey('Enter', rename)

  return (
    <div
      className={`pb-1 static w-full flex justify-end ${
        panelType === 3 && !focus ? 'hidden' : ''
      }`}
    >
      <button type='button' className='inline-flex -mr-1'>
        <input
          className='w-full truncate bg-transparent text-center px-0.5'
          value={inputValue}
          onInput={handleInput}
          onBlur={rename}
          disabled={!focus}
          type='text'
        />
      </button>
    </div>
  )
}
