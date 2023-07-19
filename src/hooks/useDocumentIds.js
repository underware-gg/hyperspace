import React, { useState, useEffect } from 'react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useDocumentIds } from 'hyperbox-sdk'

const useRemoteDocumentIds = (type) => {
  const { remoteStore } = useRoomContext()
  return useDocumentIds(type, remoteStore)
}

const useLocalDocumentIds = (type) => {
  const { localStore } = useRoomContext()
  return useDocumentIds(type, localStore)
}

const useMetadataDocumentIds = (type) => {
  const { metadataStore } = useRoomContext()
  return useDocumentIds(type, metadataStore)
}

export {
  useRemoteDocumentIds,
  useLocalDocumentIds,
  useMetadataDocumentIds,
  useDocumentIds,
}
