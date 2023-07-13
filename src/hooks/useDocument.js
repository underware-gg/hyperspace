import React, { useState, useEffect } from 'react'
import { useRoomContext } from '@/hooks/RoomContext'

const useRemoteDocument = (type, id) => {
  const { remoteStore } = useRoomContext()
  return useStoreDocument(type, id, remoteStore)
}

const useLocalDocument = (type, id) => {
  const { localStore } = useRoomContext()
  return useStoreDocument(type, id, localStore)
}

const useSessionDocument = (type, id) => {
  const { sessionStore } = useRoomContext()
  return useStoreDocument(type, id, sessionStore)
}

const useAgentDocument = (type, id) => {
  const { agentStore } = useRoomContext()
  return useStoreDocument(type, id, agentStore)
}

const useMetadataDocument = (type, id) => {
  const { metadataStore } = useRoomContext()
  return useStoreDocument(type, id, metadataStore)
}

const useStoreDocument = (type, id, store) => {
  const [document, setDocument] = useState(null)

  // initialize
  useEffect(() => {
    if (type && id && store) {
      setDocument(store.getDocument(type, id))
    }
  }, [type, id, store])

  // listen
  useEffect(() => {
    if (!store || !id || !type) return

    function _handleChange(documentId, document) {
      if (documentId === id) {
        setDocument(document)
      }
    }

    store.on({ type, event: 'change' }, _handleChange)
    store.on({ type, event: 'delete' }, _handleChange)

    return () => {
      store.off({ type, event: 'change' }, _handleChange)
      store.off({ type, event: 'delete' }, _handleChange)
    }
  }, [type, id, store])

  return document
}

export {
  useRemoteDocument,
  useLocalDocument,
  useSessionDocument,
  useAgentDocument,
  useMetadataDocument,
  useStoreDocument,
} 
