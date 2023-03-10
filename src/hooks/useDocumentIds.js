import { useState, useEffect } from 'react'
import { useRoomContext } from '@/hooks/RoomContext'

const useRemoteDocumentIds = (type) => {
  const { remoteStore } = useRoomContext()
  return useDocumentIds(type, remoteStore)
}

const useLocalDocumentIds = (type) => {
  const { localStore } = useRoomContext()
  return useDocumentIds(type, localStore)
}

const useDocumentIds = (type, store) => {
  const [ids, setIds] = useState([])

  useEffect(() => {
    if (!store) return

    let _mounted = true

    function _updateIds() {
      if (_mounted && store) {
        const _ids = store.getIds(type) ?? []
        setIds(_ids)
      }
    }

    _updateIds()

    store.on({ type, event: 'create' }, _updateIds)
    store.on({ type, event: 'delete' }, _updateIds)
    return () => {
      store.off({ type, event: 'create' }, _updateIds)
      store.off({ type, event: 'delete' }, _updateIds)
      _mounted = false
    }
  }, [type, store])

  return ids
}

export {
  useRemoteDocumentIds,
  useLocalDocumentIds,
  useDocumentIds,
}
