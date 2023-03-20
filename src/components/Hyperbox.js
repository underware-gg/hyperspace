import { useState, useEffect, useRef, useContext } from 'react'
import { RoomContext } from '@/hooks/RoomContext'
import useGameCanvas from '@/hooks/useGameCanvas'
import Screens from '@/components/Screens'
import { render } from 'react-dom'

const Hyperbox = ({
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
  const { gameCanvas, view3d } = useGameCanvas(render2d, render3d)
  const canvas2dRef = useRef()
  const canvas3dRef = useRef()

  useEffect(() => {
    return () => {
      // _shutdownGame()
    }
  }, [])

  useEffect(() => {
    if (autoFocus) {
      gameCanvas?.focus()
    }
  }, [autoFocus, gameCanvas])

  useEffect(() => {
    if (!render2d && !render3d) {
      console.warn(`<Hyperbox> requires render2d and/or render3d`)
    } else {
      const ready2d = !render2d || canvas2dRef.current != null
      const ready3d = !render3d || canvas3dRef.current != null
      setCanvasesReady(ready2d && ready3d)
    }
  }, [canvas2dRef.current, canvas3dRef.current, render2d, render3d])

 const _shutdownGame = () => {
    if (game) {
      console.log(`[${game.room.slug}] <Hyperbox> shutdown...`)
      game.shutdown()
      dispatchRoom(null)
    }
  }

  useEffect(() => {
    if (slug && canvasesReady && !isLoading && slug != game?.room?.slug) {
      _shutdownGame()
      setGame(null)
      setIsLoading(true)
      console.log(`[${slug}] <Hyperbox> import...`)
      import('src/core/game').then(async ({ default: Game }) => {
        console.log(`[${slug}] <Hyperbox> init...`)
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
            display: view3d ? 'none' : 'block',
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
            display: view3d ? 'block' : 'none',
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

export default Hyperbox