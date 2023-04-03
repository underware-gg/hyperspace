


import React, { useRef, useEffect } from 'react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useDocument } from '@/hooks/useDocument'
import { useRoom } from '@/hooks/useRoom'

const Map2D = ({
  slug,
  onLoaded = (loaded) => { }
}) => {
  const canvasRef = useRef()

  // useRoom() will dispatch to RoomContext when the room is loaded
  useRoom(slug, canvasRef.current, true)
  const { room } = useRoomContext()

  const map = useDocument('map', 'world')

  useEffect(() => {
    onLoaded(room != null)
    if (room) {
      room.render()
    } else {
      const _context = canvasRef.current?.getContext('2d') ?? null
      if(_context) {
        _context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
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

export default Map2D
