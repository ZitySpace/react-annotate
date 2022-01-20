/* eslint-disable no-unused-vars */
// import randomColor from 'randomcolor'
// import { Label } from '../label/Label'

// export const parseCategorysAndColors = (
//   categoryNames: string[],
//   colors: string[]
// ) => {
//   // align the arrays' length
//   const categoryNamesLen = categoryNames.length
//   const colorsLen = colors?.length | 0
//   const extendsColors: string[] =
//     colorsLen - categoryNamesLen > 0
//       ? colors.slice(categoryNamesLen)
//       : getRandomColors()

//   colors =
//     colorsLen - categoryNamesLen < 0
//       ? [...colors, ...getRandomColors(categoryNamesLen - colorsLen)]
//       : colors.slice(0, categoryNamesLen)

//   const categoryColors = {}
//   categoryNames.forEach((cate, idx) => {
//     categoryColors[cate] = colors[idx]
//   })

//   return {
//     categoryNames,
//     categoryColors,
//     extendsColors
//   }
// }

// export const getRandomColors = (count: number = 16) => {
//   return randomColor({
//     seed: Date.now(),
//     format: 'rgba',
//     alpha: 0.75,
//     count
//   })
// }

// export const getAllCategoryNames = (annotationsList: Label[][]) => {
//   const categoryNames: string[] = []
//   annotationsList.forEach((annotations: Label[]) => {
//     annotations.forEach((anno: Label) => {
//       const { categoryName } = anno
//       if (categoryName) categoryNames.push(categoryName)
//     })
//   })
//   return categoryNames
// }
