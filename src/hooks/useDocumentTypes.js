import { useState, useEffect } from 'react'
import { getRemoteStore, getLocalStore } from '@/core/singleton'

const remoteStore = getRemoteStore()
const localStore = getLocalStore()

const useRemoteDocumentTypes = () => {
  return useDocumentTypes(remoteStore)
}

const useLocalDocumentTypes = () => {
  return useDocumentTypes(localStore)
}

const useDocumentTypes = (store) => {
  const [types, setTypes] = useState([])

  useEffect(() => {
    let _mounted = true

    function _updateTypes() {
      const _types = store?.getTypes() ?? []
      console.log(`_updateTypes`, _types)
      if (_types.length != types.length && _mounted) {
        console.log(`_updateTypes SET`)
        setTypes(_types)
      }
    }

    _updateTypes()

    if (store) {
      store.on(null, _updateTypes)
      return () => {
        store.off(null, _updateTypes)
        _mounted = false
      }
    }
  }, [store])

  // console.log(`_updateTypes TYPES:`, types)
  return types
}

export {
  useRemoteDocumentTypes,
  useLocalDocumentTypes,
  useDocumentTypes,
}
