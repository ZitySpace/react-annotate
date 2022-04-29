import { useEffect } from 'react'
import { useStateList } from 'react-use'
import { Label } from '../classes/Label'
import { ImageObject } from '../interfaces/basic'
import { UseStateStackReturnProps } from './useStateStack'

export interface UseDataReturnProps {
  imageObj: ImageObject
  prevImg: () => void
  nextImg: () => void
  save: () => Label[]
}

export const useData = (
  imagesList: ImageObject[],
  stateStack: UseStateStackReturnProps,
  initIndex: number = 0
) => {
  const {
    state: imageObj,
    setStateAt: setImageIdx,
    prev,
    next
  } = useStateList<ImageObject>(imagesList) // refer: https://github.com/streamich/react-use/blob/master/docs/useStateList.md

  const { nowState } = stateStack

  const methods = {
    save: () => {
      console.log('save called')
      return nowState
    },

    prevImg: () => (prev() as undefined) || methods.save(),
    nextImg: () => (next() as undefined) || methods.save()
  }

  useEffect(() => {
    initIndex && setImageIdx(initIndex)
  }, [])

  return { imageObj, ...methods }
}
