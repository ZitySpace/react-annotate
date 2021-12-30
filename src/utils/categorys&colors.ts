/* eslint-disable no-unused-vars */
import randomColor from 'randomcolor'
import { Label } from '../interface/basic'

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

export const getAllCategoryNames = (annotationsList: Label[][]) => {
  const categoryNames: string[] = []
  annotationsList.forEach((annotations: Label[]) => {
    annotations.forEach((anno: Label) => {
      const { categoryName } = anno
      if (categoryName) categoryNames.push(categoryName)
    })
  })
  return categoryNames
}

export const groupBy = (annotations: Label[], property: string) => {
  return annotations.reduce((groupedAnnos: any, theAnno: Label) => {
    if (!groupedAnnos[theAnno[property]]) {
      groupedAnnos[theAnno[property]] = []
    }
    groupedAnnos[theAnno[property]].push(theAnno)
    return groupedAnnos
  }, {})
}

export const getAbbreviacion = (category: string, length: number) => {
  return category.slice(0, length) + (category.length > length ? '...' : '')
}
