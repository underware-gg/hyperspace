import React, { useState, useEffect } from 'react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useDocumentTypes } from 'hyperbox-sdk'

const useRemoteDocumentTypes = () => {
  const { remoteStore } = useRoomContext()
  return useDocumentTypes(remoteStore)
}

const useLocalDocumentTypes = () => {
  const { localStore } = useRoomContext()
  return useDocumentTypes(localStore)
}

export {
  useRemoteDocumentTypes,
  useLocalDocumentTypes,
  useDocumentTypes,
}
