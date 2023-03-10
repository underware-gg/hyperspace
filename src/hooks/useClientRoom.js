import { nanoid } from 'nanoid'
import { useState, useEffect } from 'react'
import Store from '@/core/store'
import * as ClientRoom from '@/core/networking'

const useClientRoom = (slug) => {
  const [agentId, setAgentId] = useState(null)
  const [room, setRoom] = useState(null)
  const [store, setStore] = useState(null)

  useEffect(() => {
    setAgentId(nanoid())
  }, [])

  useEffect(() => {
    let _mounted = true
    let _room = null

    if (slug && agentId) {
      const _store = new Store()
      _room = ClientRoom.create(slug, _store, agentId)
      _room.init()
      // _room.on('agent-join', (id) => {
      //   if (id === agentId && _mounted) {
      //     setStore(_store)
      //   }
      // })
      _room.on('patched', (patched) => {
        if (patched && _mounted && !store) {
          setStore(_store)
        }
      })
    }
    
    setRoom(_room)
    setStore(null)

    return () => {
      _mounted = false
      if (_room) {
        _room.disconnect()
      }
    }
  }, [slug, agentId])

  return {
    agentId,
    room,
    slug: room?.slug ?? null,
    store,
  }
}

export {
  useClientRoom,
} 
