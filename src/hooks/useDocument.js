import { useState, useEffect } from 'react'
import { getRemoteStore } from '@/core/singleton'

const remoteStore = getRemoteStore()

const useDocument = (type, id) => {
  const [document, setDocument] = useState(null)

  useEffect(() => {
    function _handleChange(innerId, document) {
      if (innerId === id) {
        setDocument(document)
      }
    }

    remoteStore.on({ type, event: 'change' }, _handleChange)
    remoteStore.on({ type, event: 'delete' }, _handleChange)

    return () => {
      remoteStore.off({ type, event: 'change' }, _handleChange)
      remoteStore.off({ type, event: 'delete' }, _handleChange)
    }
  }, [type, id])

  useEffect(() => {
    if (id) {
      setDocument(remoteStore.getDocument(type, id))
    }
  }, [id])

  return document
}

export default useDocument
