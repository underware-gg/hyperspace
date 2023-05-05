


import React, { useRef, useEffect } from 'react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useDocument, useStoreDocument } from '@/hooks/useDocument'
import { useRoom } from '@/hooks/useRoom'
import Map, { MAX_MAP_SIZE } from '@/core/components/map'

const MapPreviewFromSlugToRoomContext = ({
  slug,
  onLoaded = (loaded) => { }
}) => {
  const canvasRef = useRef(null)

  // useRoom() will dispatch to RoomContext when the room is loaded
  useRoom({ slug, canvas2d: canvasRef.current })
  const { room } = useRoomContext()

  const map = useDocument('map', 'world')

  useEffect(() => {
    onLoaded(room != null)
    if (room) {
      room.render()
    } else {
      const _context = canvasRef.current?.getContext('2d') ?? null
      _context?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }, [room])

  useEffect(() => {
    if (map && room) {
      room.render()
    }
  }, [map, room])

  return (
    <div>
      <canvas
        id='room'
        ref={canvasRef}
        border='1px'
        width={process.env.RENDER_WIDTH}
        height={process.env.RENDER_HEIGHT}
        className='FillParent Map2D'
      >
        Canvas not supported by your browser.
      </canvas>
    </div>
  )
}

const MapPreview = ({
  store,
}) => {
  const canvasRef = useRef()

  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current?.getContext('2d') ?? null
      if (context) {
        context.save()
        context.scale(process.env.RENDER_HEIGHT / MAX_MAP_SIZE, process.env.RENDER_HEIGHT / MAX_MAP_SIZE)



        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        Map.draw2dMap('world', context, store)
        context.restore()
      }
    }
  }, [canvasRef])

  return (
    <div>
      <canvas
        id='room'
        ref={canvasRef}
        border='1px'
        width={process.env.RENDER_HEIGHT}
        height={process.env.RENDER_HEIGHT}
        className='FillParent Map2D'
      >
        Canvas not supported by your browser.
      </canvas>
    </div>
  )
}


export {
  MapPreviewFromSlugToRoomContext,
  MapPreview,
}
