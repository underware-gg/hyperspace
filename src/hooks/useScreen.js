import React, { useState, useEffect } from 'react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useRemoteDocumentIds } from '@/hooks/useDocumentIds'
import { useRemoteDocument } from '@/hooks/useDocument'

const useScreen = (idOrName) => {
  const { remoteStore } = useRoomContext()
  const screenIds = useRemoteDocumentIds('screen')

  const [screenId, setScreenId] = useState(null)
  const screen = useRemoteDocument('screen', screenId)

  useEffect(() => {
    if (screenIds && remoteStore) {
      for (const id of screenIds) {
        const screen = remoteStore.getDocument('screen', id);
        if (idOrName == id || idOrName == screen?.name) {
          setScreenId(id)
          return
        }
      }
    }
    setScreenId(null)
  }, [remoteStore, idOrName, screenIds])

  return {
    screenId,
    screen,
  }
}

export {
  useScreen,
}
