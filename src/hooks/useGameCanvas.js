import { useMemo } from 'react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useLocalDocument } from '@/hooks/useDocument'

const useGameCanvas = (render2d = true, render3d = true) => {
  const { canvas2d, canvas3d } = useRoomContext()

  const is3d = useLocalDocument('show-3d', 'world') ?? false
  const _is3d = (is3d && render3d)

  const gameCanvas = useMemo(() => (_is3d ? canvas3d : canvas2d), [_is3d, canvas2d, canvas3d])

  return {
    canvas2d,
    canvas3d,
    gameCanvas,
    is3d: _is3d,
  }
}

export default useGameCanvas
