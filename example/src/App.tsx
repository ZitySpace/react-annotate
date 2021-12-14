import React from 'react'

import { ImageAnnotater } from 'react-annotate-image'
import 'react-annotate-image/dist/index.css'

import { imgObj } from './mockdata'

const App = () => {
  return (
    <div className='h-screen w-screen'>
      <ImageAnnotater imageObj={imgObj} />
    </div>
  )
}

export default App
