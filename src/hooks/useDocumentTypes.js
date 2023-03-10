import { useState, useEffect } from 'react'
import { useRoomContext } from '@/hooks/RoomContext'

const useRemoteDocumentTypes = () => {
  const { remoteStore } = useRoomContext()
  return useDocumentTypes(remoteStore)
}

const useLocalDocumentTypes = () => {
  const { localStore } = useRoomContext()
  return useDocumentTypes(localStore)
}

const useDocumentTypes = (store) => {
  const [types, setTypes] = useState([])

  useEffect(() => {
    if (!store) return

    let _mounted = true

    function _updateTypes() {
      if (store && _mounted) {
        const _types = store.getTypes() ?? []
        if (_types.length != types.length && _mounted) {
          setTypes(_types)
        }
      }
    }

    _updateTypes()

    store.on(null, _updateTypes)
    return () => {
      store.off(null, _updateTypes)
      _mounted = false
    }
  }, [store])

  return types
}

export {
  useRemoteDocumentTypes,
  useLocalDocumentTypes,
  useDocumentTypes,
}
