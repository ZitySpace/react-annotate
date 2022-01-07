import React from 'react'

import { NewImageAnnotater } from 'react-annotate-image'
import 'react-annotate-image/dist/index.css'

import { pagingData } from './mockdata'

const App = () => {
  return (
    <div className='h-screen w-screen'>
      {/* <ImageAnnotater
        imagesList={pagingData}
        index={1}
        colors={Object.values(projectMock.colors)}
      /> */}
      <NewImageAnnotater imagesList={pagingData} index={1} />
    </div>
  )
}

export default App
