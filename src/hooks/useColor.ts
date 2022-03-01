import randomColor from 'randomcolor'
import { useRef } from 'react'

export interface UseColorsReturnProps {
  init: ({
    categoryColors,
    categories,
    colors
  }: {
    categoryColors?: Map<string, string> | undefined
    categories?: string[]
    colors?: string[]
  }) => void
  get: (category: string) => string
  set: (category: string, color: string) => void
  rename: (sourceCategory: string, newCategory: string) => void
}

export const useColors = () => {
  const colorRef = useRef<Map<string, string>>(new Map<string, string>())

  const getRandomColor = () => {
    let newColor = ''
    do {
      newColor = randomColor({
        seed: Date.now(),
        format: 'rgba',
        alpha: 0.75,
        count: 1
      })[0]
    } while (Array.from(colorRef.current.values()).includes(newColor))
    return newColor
  }

  const addRandom = (category: string) => {
    const newColor = getRandomColor()
    colorRef.current?.set(category, newColor)
    return newColor
  }

  const actions = {
    init: ({
      categoryColors,
      categories = [],
      colors = []
    }: {
      categoryColors?: Map<string, string> | undefined
      categories?: string[]
      colors?: string[]
    }) => {
      if (categoryColors) colorRef.current = categoryColors
      else if (categories.length) {
        for (let i = 0; i < categories.length; i++) {
          colorRef.current?.set(categories[i], colors[i] || getRandomColor())
        }
      }
    },

    get: (category: string) =>
      colorRef.current?.get(category) || addRandom(category),

    set: (category: string, color: string) =>
      colorRef.current?.set(category, color),

    rename: (sourceCategory: string, newCategory: string) => {
      colorRef.current?.set(newCategory, actions.get(sourceCategory))
      colorRef.current?.delete(sourceCategory)
    }
  }

  return { ...actions }
}
