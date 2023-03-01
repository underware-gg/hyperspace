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
      const _room = ClientRoom.create(slug, _store, agentId)
      _room.init()
      _room.on('agent-join', (id) => {
        if (id === agentId) {
          // console.log(`useClientRoom(${_room.slug}) joined`)
          setStore(_store)
        }
      })
      _store.on(null, (source, type, id, path, value) => {
        // console.log(`useClientRoom() CHANGE:`, source, type, id)
      })
      // console.log(`useClientRoom(${_room.slug}) agent[${_room.agentId}]`)
    }
    setRoom(_room)
    setStore(null)
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
