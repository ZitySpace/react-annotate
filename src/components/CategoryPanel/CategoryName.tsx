import React, { useState } from 'react'

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
  const handleBlur = () => {
    if (!inputValue || inputValue === categoryName) setInputValue(categoryName)
    else renameCategory(categoryName, inputValue)
  }

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
          onBlur={handleBlur}
          disabled={!focus}
          type='text'
        />
      </button>
    </div>
  )
}
