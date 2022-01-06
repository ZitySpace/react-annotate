import React, { useCallback, useRef, useState } from 'react'
import { Dimension } from '../interface/basic'

export const useImage = ({ imageObj }: { imageObj: any }) => {
  const [imageDims, setImageDims] = useState<Dimension | null>(null)
  const imgElRef = useRef(null)

  const onLoad = useCallback(() => {
    const img = imgElRef.current
    if (img) {
      const { width: w, height: h } = (
        img as HTMLElement
      ).getBoundingClientRect()
      setImageDims({ w, h })
    }
  }, [imgElRef.current])

  return [
    <img
      alt={imageObj.fileName}
      title={imageObj.fileName}
      src={imageObj.blobUrl}
      loading='lazy'
      onLoad={onLoad}
      className='object-contain max-h-full invisible'
      ref={imgElRef}
    />,
    imageDims
  ]
}
