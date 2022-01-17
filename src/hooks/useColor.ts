import randomColor from 'randomcolor'
import { useMemo, useRef } from 'react'

export interface UseColorsReturnProps {
  get: (categoryName: string) => string
  set: (categoryName: string, newColor: string) => void
  addRandom: (categoryName: string) => string
}

export const useColors = ({
  categoryColors,
  categoryNames = [],
  colors = []
}: {
  categoryColors: Map<string, string> | undefined
  categoryNames?: string[]
  colors?: string[]
}) => {
  const color = useRef<Map<string, string>>()

  const getRandomColor = () =>
    randomColor({ seed: Date.now(), format: 'rgba', alpha: 0.75, count: 1 })[0]

  // initialize colors
  if (categoryColors) color.current = categoryColors
  else if (categoryNames.length) {
    for (let i = 0; i < categoryNames.length; i++) {
      color.current?.set(categoryNames[i], colors[i] || getRandomColor())
    }
  }

  const actions = useMemo(
    () => ({
      get: (categoryName: string) =>
        color.current?.get(categoryName) || actions.addRandom(categoryName),
      set: (categoryName: string, newColor: string) => {
        color.current?.set(categoryName, newColor)
      },
      addRandom: (categoryName: string) => {
        const newColor = getRandomColor()
        color.current?.set(categoryName, newColor)
        return newColor
      }
    }),
    [color]
  )

  return { ...actions }
}
