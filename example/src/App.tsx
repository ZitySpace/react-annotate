import React from 'react'

import { NewImageAnnotater } from 'react-annotate-image'
import 'react-annotate-image/dist/index.css'

import { pagingData, projectMock } from './mockdata'

const App = () => {
  const colors = projectMock.colors
  const categoryColors = new Map<string, string>(Object.entries(colors))

  return (
    <div className='h-screen w-screen'>
      <NewImageAnnotater
        imagesList={pagingData}
        index={1}
        categoryColors={categoryColors}
      />
    </div>
  )
}

export default App
