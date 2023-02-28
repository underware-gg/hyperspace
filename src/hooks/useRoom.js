import { useState, useEffect } from 'react'
import * as ClientRoom from '@/core/networking'

const useRoom = () => {
  const [room, setRoom] = useState({})

  useEffect(() => {
    async function _getRoom() {
      const room = ClientRoom.get();
      if (room) {
        setRoom(room)
      } else {
        setTimeout(_getRoom, 100)
      }
    }
    _getRoom()
  }, [])

  return room
}

export default useRoom
