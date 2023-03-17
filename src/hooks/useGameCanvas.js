import { useMemo } from 'react'
import { useRoomContext } from '@/hooks/RoomContext'
import useProfile from '@/hooks/useProfile'

const useGameCanvas = (render2d = true, render3d = true) => {
  const { canvas2d, canvas3d } = useRoomContext()

  const { view3d } = useProfile()
  const _view3d = (view3d && render3d)

  const gameCanvas = useMemo(() => (_view3d ? canvas3d : canvas2d), [_view3d, canvas2d, canvas3d])

  return {
    canvas2d,
    canvas3d,
    gameCanvas,
    view3d: _view3d,
  }
}

export default useGameCanvas
