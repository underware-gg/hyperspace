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
// options = {
//   slug       // 'slug', null if loading, undefined if not needed
//   canvas2d   // the canvas element, null if loading, undefined if not needed
// }
const useRoom = (options = {}, init = {}) => {
  const [room, setRoom] = useState(null)
  const { dispatchRoom } = useContext(RoomContext)

  useEffect(() => {
    let _mounted = true
    let _room = null

    const _initRoom = async (slug, canvas2d) => {
      _room = new Room()
      await _room.init({ slug, canvas2d, ...init })
      if (_mounted) {
        setRoom(_room)
        dispatchRoom(_room)
      }
    }

    setRoom(null)
    dispatchRoom(null)

    if ((options.slug || options.slug === undefined) && (options.canvas2d || options.canvas2d === undefined)) {
      _initRoom(options.slug ?? null, options.canvas2d ?? null)
    }

    return () => {
      _mounted = false
      _room?.shutdown()
      _room = null
    }
  }, [options.slug, options.canvas2d])

  return {
    room,
  }
}

//----------------------------------
// Independent client and store
// uses a disposable agentId
// can be used to read document data.
// For rendering, useRoom()
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
      _clientRoom = ClientRoom.create({
        slug,
        store: _store,
        agentId,
      })
      _clientRoom.init({})
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
      _clientRoom?.shutdown()
      _clientRoom = null
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
