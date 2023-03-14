import { useState, useEffect, useRef, useContext } from 'react'
import { RoomContext } from '@/hooks/RoomContext'
import useGameCanvas from '@/hooks/useGameCanvas'
import Screens from '@/components/Screens'
import { render } from 'react-dom'

const Game = ({
  slug,
  autoFocus = true,
  render2d = true,
  render3d = true,
  renderScreens = true,
}) => {
  const [canvasesReady, setCanvasesReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [game, setGame] = useState(null)
  const { dispatchRoom } = useContext(RoomContext)
  const { gameCanvas, is3d } = useGameCanvas(render2d, render3d)
  const canvas2dRef = useRef()
  const canvas3dRef = useRef()

  useEffect(() => {
    if (autoFocus) {
      gameCanvas?.focus()
    }
  }, [is3d, autoFocus, gameCanvas])

  useEffect(() => {
    if (!render2d && !render3d) {
      console.warn(`<Game> requires render2d and/or render3d`)
    } else {
      const ready2d = !render2d || canvas2dRef.current != null
      const ready3d = !render3d || canvas3dRef.current != null
      setCanvasesReady(ready2d && ready3d)
    }
  }, [canvas2dRef.current, canvas3dRef.current, render2d, render3d])

  useEffect(() => {
    if (slug && canvasesReady && !isLoading && slug != game?.room?.slug) {
      if (game) {
        console.log(`<Game> disconnect...`)
        game.room.clientRoom.disconnect()
        dispatchRoom(null)
        setGame(null)
      }
      console.log(`<Game> import...`, game?.room?.slug, '>', slug)
      setIsLoading(true)
      import('src/core/game').then(async ({ default: Game }) => {
        console.log(`<Game> init...`)
        const _game = new Game()
        await _game.init(slug, canvas2dRef.current, canvas3dRef.current)
        dispatchRoom(_game.room)
        setGame(_game)
        setIsLoading(false)
      })
    }
  }, [slug, canvasesReady])

  return (
    <div>
      {render2d &&
        <canvas
          id='game'
          ref={canvas2dRef}
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
      }

      {render3d &&
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
      }

      {renderScreens &&
        <Screens />
      }
    </div>
  )
}

export default Game
