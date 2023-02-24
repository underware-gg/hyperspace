import { useState, useEffect } from 'react'
import { getRemoteStore } from '@/core/singleton'

const remoteStore = getRemoteStore()

const useDocumentIds = (type, store = remoteStore) => {
  const [ids, setIds] = useState([])

  useEffect(() => {
    function _handleChange(innerId, document) {
      setIds(store.getIds(type))
    }

    setIds(store.getIds(type))

    store.on({ type, event: 'create' }, _handleChange)
    store.on({ type, event: 'delete' }, _handleChange)

    return () => {
      store.off({ type, event: 'create' }, _handleChange)
      store.off({ type, event: 'delete' }, _handleChange)
    }
  }, [type])

  return ids
}

export default useDocumentIds
