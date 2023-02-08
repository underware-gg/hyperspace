import { useState, useEffect } from 'react'
import { getRemoteStore, getLocalStore } from '@/core/singleton'

const remoteStore = getRemoteStore()
const localStore = getLocalStore()

const useDocument = (type, id) => {
  return _useDocument(type, id, remoteStore)
}

const useLocalDocument = (type, id) => {
  return _useDocument(type, id, localStore)
}

const _useDocument = (type, id, store) => {
  const [document, setDocument] = useState(null)

  useEffect(() => {
    function _handleChange(innerId, document) {
      if (innerId === id) {
        setDocument(document)
      }
    }

    store.on({ type, event: 'change' }, _handleChange)
    store.on({ type, event: 'delete' }, _handleChange)

    return () => {
      store.off({ type, event: 'change' }, _handleChange)
      store.off({ type, event: 'delete' }, _handleChange)
    }
  }, [type, id])

  useEffect(() => {
    if (id) {
      setDocument(store.getDocument(type, id))
    }
  }, [id])

  return document
}

export {
  useDocument,
  useLocalDocument,
} 
