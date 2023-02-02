import { useState, useEffect } from 'react'
import { getLocalStore } from '@/core/singleton'

const localStore = getLocalStore()

const useLocalDocument = (type, id) => {
  const [document, setDocument] = useState(null)

  useEffect(() => {
    // This is not efficient.
    function handleChange(innerId, document) {
      if (innerId === id) {
        setDocument(document)
      }
    }

    localStore.on({ type, event: 'change' }, handleChange)

    return () => {
      localStore.off({ type, event: 'change' }, handleChange)
    }
  }, [type])

  return document
}

export default useLocalDocument
