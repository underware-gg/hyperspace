import { nanoid } from 'nanoid'
import { useState, useEffect } from 'react'
import Store from '@/core/store'
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

const useClientRoom = (slug) => {
  const [agentId, setAgentId] = useState(null)
  const [room, setRoom] = useState(null)
  const [store, setStore] = useState(null)

  useEffect(() => {
    setAgentId(nanoid())
  }, [])

  useEffect(() => {
    if (!agentId) {
      return
    }

    let _room = null
    if (slug) {
      const _store = new Store()
      _room = ClientRoom.create(slug, _store, agentId)
      _room.init()
      _room.on('agent-join', (id) => {
        if (id === agentId) {
          setStore(_store)
        }
      })
      _store.on(null, (source, type, id, path, value) => {
      })
    }
    
    setRoom(_room)
    setStore(null)

    if (_room) {
      return () => {
        _room.disconnect()
      }
    }
  }, [agentId, slug])

  return {
    agentId,
    room,
    slug: room?.slug ?? null,
    store,
  }
}

export {
  useRoom,
  useClientRoom,
} 
