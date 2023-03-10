import { useState, useEffect, useRef, useContext } from 'react'
import {
  Box,
} from '@chakra-ui/react'
import { RoomContext } from '@/hooks/RoomContext'
import useGameCanvas from '@/hooks/useGameCanvas'
import Screens from '@/components/Screens'

const Game = ({
  slug,
  autoFocus=true,
 }) => {
  const [game, setGame] = useState(null)
  const { dispatchRoom } = useContext(RoomContext)
  const { gameCanvas, is3d } = useGameCanvas()
  const canvasRef = useRef()
  const canvas3dRef = useRef()

  useEffect(() => {
    if (autoFocus) {
      gameCanvas?.focus()
    }
  }, [is3d, autoFocus, gameCanvas])

  useEffect(() => {
    if (slug && canvasRef.current && canvas3dRef.current && !game) {
      import('src/core/game').then(async ({ default: Game }) => {
        const _game = new Game()
        await _game.init(slug, canvasRef.current, canvas3dRef.current)
        dispatchRoom(_game.room)
        setGame(_game)
      })
    }
  }, [slug, canvasRef.current, canvas3dRef.current])

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
