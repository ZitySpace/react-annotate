import React from 'react'

import { Annotator, RectLabel } from 'react-annotate-image'
import 'react-annotate-image/dist/index.css'

import { pagingData, projectMock } from './mockdata'
const imagesList = pagingData.map((img) => ({
  ...img,
  annotations: img.annotations.map((anno: any, id: number) => {
    const { x, y, w, h, category } = anno
    return new RectLabel({ x, y, w, h, id, category })
  })
}))

const App = () => {
  const colors = projectMock.colors
  const categoryColors = new Map<string, string>(Object.entries(colors))

  return (
    <div className='h-screen w-screen'>
      <Annotator
        imagesList={imagesList}
        index={1}
        categoryColors={categoryColors}
      />
    </div>
  )
}

export default App
