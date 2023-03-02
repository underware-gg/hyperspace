


import React, { useRef, useState, useEffect } from 'react'
import { loadTextures } from '@/core/textures'
import { useClientRoom } from '@/hooks/useRoom'
import * as Map from '@/core/components/map'

const Map2D = ({
  slug,
  onLoaded = (loaded) => { }
}) => {
  const canvasRef = useRef()
  const { store } = useClientRoom(slug)

  useEffect(() => {
    async function _loadTextures() {
      await loadTextures()
    }
    _loadTextures()
  }, [])

  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current?.getContext('2d') ?? null
      if (store) {
        // console.log(`<Map2D> render`)
        Map.render2d('world', context, store)
        onLoaded(true)
      } else {
        // console.log(`<Map2D> clear`)
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        onLoaded(false)
      }
    }
  }, [store])

  return (
    <div>
      <canvas
        id='room'
        ref={canvasRef}
        border='1px'
        width={process.env.CANVAS_WIDTH}
        height={process.env.CANVAS_HEIGHT}
        className='FillParent Map2D'
      >
        Canvas not supported by your browser.
      </canvas>
    </div>
  )
}

export default Map2D
