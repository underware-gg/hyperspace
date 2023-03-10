import { useEffect, useRef, useContext } from 'react'
import {
  Box,
} from '@chakra-ui/react'
import { RoomContext } from '@/hooks/RoomContext'
import { useLocalDocument } from '@/hooks/useDocument'
import { focusGameCanvas } from '@/core/game-canvas'
import Screens from '@/components/Screens'

const Game = ({ slug }) => {
  const { dispatchRoom, room } = useContext(RoomContext)
  const is3d = useLocalDocument('show-3d', 'world') ?? false
  const canvasRef = useRef()
  const canvas3dRef = useRef()

  useEffect(() => {
    focusGameCanvas()
  }, [is3d, canvasRef, canvas3dRef])

  useEffect(() => {
    if (slug && canvasRef.current && canvas3dRef.current && !room) {
      import('src/core/game').then(({ default: Game }) => {
        const game = new Game()
        game.init(slug, canvasRef.current, canvas3dRef.current)
        dispatchRoom(game.room)
      })
    }
  }, [slug, canvasRef.current, canvas3dRef.current, room])

  return (
    <Box
      className='Relative'
      border='1px'
      borderRadius='2px'
      maxH='700'
    // h='700'
    >
      <canvas
        id='game'
        ref={canvasRef}
        border='1px'
        borderradius={4}
        width={process.env.CANVAS_WIDTH}
        height={process.env.CANVAS_HEIGHT}
        style={{
          width: '100%',
          height: '100%',
          display: is3d ? 'none' : 'block',
        }}
        tabIndex='1'
      >
        Canvas not supported by your browser.
      </canvas>
      <canvas
        id='game3D'
        ref={canvas3dRef}
        border='1px'
        borderradius={4}
        width={process.env.CANVAS_WIDTH}
        height={process.env.CANVAS_HEIGHT}
        style={{
          width: '100%',
          height: '100%',
          display: is3d ? 'block' : 'none',
        }}
        tabIndex='2'
      >
        Canvas not supported by your browser.
      </canvas>

      <Screens />
    </Box>
  )
}

export default Game
