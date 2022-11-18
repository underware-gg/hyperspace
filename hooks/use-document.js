import { useState, useEffect } from 'react'
import { getRemoteStore } from 'core/singleton'

const remoteStore = getRemoteStore()

const useDocument = (type, id) => {
  const [document, setDocument] = useState(null)

  useEffect(() => {
    // This is not efficient.
    function handleChange(innerId, document) {
      if (innerId === id) {
        setDocument(document)
      }
    }

    remoteStore.on({ type, event: 'change' }, handleChange)

    return () => {
      remoteStore.off({ type, event: 'change' }, handleChange)
    }
  }, [type])

  return document
}

export default useDocument
