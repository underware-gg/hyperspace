


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
  useRoom({
    slug,
    canvas2d: canvasRef.current,
  }, {
    openSession: false,
    openAgents: false,
  })
  const { room } = useRoomContext()

  const map = useDocument('map2', 'world')

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
    if (room && map) {
      room.render()
    }
  }, [room, map])

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
        const scale = process.env.RENDER_HEIGHT / MAX_MAP_SIZE.height
        const aspect = MAX_MAP_SIZE.width / MAX_MAP_SIZE.height
        context.save()
        context.scale(scale / aspect, scale)
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        Map.draw2dMap('world', context, store)
        context.restore()
      }
    }
  }, [canvasRef])

  return (
    <div className='FillParent'>
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
