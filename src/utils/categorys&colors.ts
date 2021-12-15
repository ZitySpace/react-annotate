/* eslint-disable no-unused-vars */
import randomColor from 'randomcolor'
import { PointLabel, RectLabel } from '../interface/annotations'

export const parseCategorysAndColors = (
  categoryNames: string[],
  colors: string[]
) => {
  // align the arrays' length
  const categoryNamesLen = categoryNames.length
  const colorsLen = colors?.length | 0
  const extendsColors: string[] =
    colorsLen - categoryNamesLen > 0
      ? colors.slice(categoryNamesLen)
      : getRandomColors()

  colors =
    colorsLen - categoryNamesLen < 0
      ? [...colors, ...getRandomColors(categoryNamesLen - colorsLen)]
      : colors.slice(0, categoryNamesLen)

  const categoryColors = {}
  categoryNames.forEach((cate, idx) => {
    categoryColors[cate] = colors[idx]
  })

  return {
    categoryNames,
    categoryColors,
    extendsColors
  }
}

export const getRandomColors = (count: number = 16) => {
  return randomColor({
    seed: Date.now(),
    format: 'rgba',
    alpha: 0.75,
    count
  })
}

export const getAllCategoryNames = (
  annotationsList: (RectLabel | PointLabel)[][]
) => {
  const categoryNames: string[] = []
  annotationsList.forEach((annotations: (RectLabel | PointLabel)[]) => {
    annotations.forEach((anno: RectLabel | PointLabel) => {
      const { categoryName } = anno
      if (categoryName) categoryNames.push(categoryName)
    })
  })
  return categoryNames
}
