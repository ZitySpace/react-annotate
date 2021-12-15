import React from 'react'

import { ImageAnnotater } from 'react-annotate-image'
import 'react-annotate-image/dist/index.css'

import { pagingData, projectMock } from './mockdata'

const App = () => {
  return (
    <div className='h-screen w-screen'>
      <ImageAnnotater
        imagesList={pagingData}
        index={1}
        colors={Object.values(projectMock.colors)}
      />
    </div>
  )
}

export default App
