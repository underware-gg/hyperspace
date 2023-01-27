import { useState, useEffect } from 'react'
import { getRemoteStore } from 'core/singleton'

const remoteStore = getRemoteStore()

const useDocumentIds = (type) => {
  const [ids, setIds] = useState([])

  useEffect(() => {
    function _handleChange(innerId, document) {
      setIds(remoteStore.getIds(type))
    }

    remoteStore.on({ type, event: 'create' }, _handleChange)
    remoteStore.on({ type, event: 'delete' }, _handleChange)

    return () => {
      remoteStore.off({ type, event: 'create' }, _handleChange)
      remoteStore.off({ type, event: 'delete' }, _handleChange)
    }
  }, [type])

  return ids
}

export default useDocumentIds
