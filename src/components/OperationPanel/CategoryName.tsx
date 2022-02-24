import React, { useState } from 'react'
import { useKey } from 'react-use'
import { UseFocusReturnProps } from '../../hooks/useFocus'

export const CategoryName = ({
  categoryName,
  // panelType,
  focus,
  renameCategory
}: {
  categoryName: string
  // panelType: number
  focus: UseFocusReturnProps
  renameCategory: Function
}) => {
  // const { isFocused } = focus
  // TODOL remove this
  const nothing = { focus }
  !nothing

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
        // panelType === 3 && !isFocused({ categoryName }) ? 'hidden' : ''
        ''
      }`}
    >
      <button type='button' className='inline-flex -mr-1'>
        <input
          className='w-full truncate bg-transparent text-center px-0.5'
          value={inputValue}
          onInput={handleInput}
          onBlur={rename}
          // disabled={!isFocused({ categoryName })}
          type='text'
        />
      </button>
    </div>
  )
}
