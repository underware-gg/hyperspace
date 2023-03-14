import { useMemo } from 'react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useLocalDocument } from '@/hooks/useDocument'

const useGameCanvas = () => {
  const { canvas2d, canvas3d } = useRoomContext()

  const is3d = useLocalDocument('show-3d', 'world') ?? false

  const gameCanvas = useMemo(() => (is3d ? canvas3d : canvas2d), [is3d, canvas2d, canvas3d])

  // console.log(`useGameCanvas(${is3d})`, gameCanvas)

  return {
    canvas2d,
    canvas3d,
    gameCanvas,
    is3d,
  }
}

export default useGameCanvas
