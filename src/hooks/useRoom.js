import { nanoid } from 'nanoid'
import { useState, useEffect, useContext } from 'react'
import { RoomContext } from '@/hooks/RoomContext'
import Room from '@/core/room'
import Store from '@/core/store'
import * as ClientRoom from '@/core/networking'

//-----------------------------------------
// Open a full room inside a <RoomProvider>
// uses current agentId
// good for 2D previews
//
const useRoom = (slug, canvas2d) => {
  const [room, setRoom] = useState(null)
  const { dispatchRoom } = useContext(RoomContext)

  useEffect(() => {
    let _mounted = true
    let _room = null

    const _initRoom = async () => {
      _room = new Room()
      await _room.init(slug, canvas2d, null)
      if (_mounted) {
        setRoom(_room)
        _room.clientRoom.on('patched', (patched) => {
          dispatchRoom(_room)
        })
      }
    }

    setRoom(null)
    dispatchRoom(null)

    if (slug && canvas2d) {
      _initRoom()
    }

    return () => {
      _mounted = false
      room?.clientRoom?.disconnect()
    }
  }, [slug, canvas2d])

  return {
    room,
  }
}

//----------------------------------
// Independent client and store
// uses a disposable agentId
// can be used to read document data
// for rendering, useRoom()
//
const useClientRoom = (slug) => {
  const [agentId, setAgentId] = useState(null)
  const [clientRoom, setClientRoom] = useState(null)
  const [store, setStore] = useState(null)

  useEffect(() => {
    setAgentId(nanoid())
  }, [])

  useEffect(() => {
    let _mounted = true
    let _clientRoom = null

    if (slug && agentId) {
      const _store = new Store()
      _clientRoom = ClientRoom.create(slug, _store, agentId)
      _clientRoom.init()
      // _room.on('agent-join', (id) => {
      //   if (id === agentId && _mounted) {
      //     setStore(_store)
      //   }
      // })
      _clientRoom.on('patched', (patched) => {
        if (patched && _mounted && !store) {
          setStore(_store)
        }
      })
    }

    setClientRoom(_clientRoom)
    setStore(_clientRoom?.store ?? null)

    return () => {
      _mounted = false
      _clientRoom?.disconnect()
    }
  }, [slug, agentId])

  return {
    clientRoom,
    slug: clientRoom?.slug ?? null,
    agentId,
    store,
  }
}

export {
  useRoom,
  useClientRoom,
} 