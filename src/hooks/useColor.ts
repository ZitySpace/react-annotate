import randomColor from 'randomcolor'
import { useMemo, useRef } from 'react'

export interface UseColorsReturnProps {
  init: ({
    categoryColors,
    categoryNames,
    colors
  }: {
    categoryColors?: Map<string, string> | undefined
    categoryNames?: string[]
    colors?: string[]
  }) => void
  get: (categoryName: string) => string
  set: (categoryName: string, newColor: string) => void
}

export const useColors = () => {
  const color = useRef<Map<string, string>>(new Map<string, string>())

  const getRandomColor = () => {
    let newColor = ''
    do {
      newColor = randomColor({
        seed: Date.now(),
        format: 'rgba',
        alpha: 0.75,
        count: 1
      })[0]
    } while (Array.from(color.current.values()).includes(newColor))
    return newColor
  }

  const addRandom = (categoryName: string) => {
    const newColor = getRandomColor()
    color.current?.set(categoryName, newColor)
    return newColor
  }

  const actions = useMemo(
    () => ({
      init: ({
        categoryColors,
        categoryNames = [],
        colors = []
      }: {
        categoryColors?: Map<string, string> | undefined
        categoryNames?: string[]
        colors?: string[]
      }) => {
        if (categoryColors) color.current = categoryColors
        else if (categoryNames.length) {
          for (let i = 0; i < categoryNames.length; i++) {
            color.current?.set(categoryNames[i], colors[i] || getRandomColor())
          }
        }
      },
      get: (categoryName: string) =>
        color.current?.get(categoryName) || addRandom(categoryName),
      set: (categoryName: string, newColor: string) => {
        color.current?.set(categoryName, newColor)
      }
    }),
    [color]
  )

  return { ...actions }
}
