import React, { useMemo } from 'react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useRemoteDocument } from '@/hooks/useDocument'
import { useVeridaContext } from '@/hooks/VeridaContext'

const usePermission = (id) => {
  const { veridaIsConnected, veridaProfile, did, didAddress } = useVeridaContext()
  const { Permission } = useRoomContext()

  const docPermission = useRemoteDocument('permission', id)
  const roomPermission = useRemoteDocument('permission', id != 'world' ? 'world' : null)

  const isOwner = useMemo(() => (veridaIsConnected && docPermission?.owner == didAddress), [veridaIsConnected, docPermission])
  const canView = useMemo(() => (isOwner || Permission?.canView(id)), [id, isOwner, Permission, docPermission, roomPermission])
  const canEdit = useMemo(() => (isOwner || Permission?.canEdit(id)), [id, isOwner, Permission, docPermission, roomPermission])

  return {
    permission: docPermission,
    isOwner,
    canView,
    canEdit,
  }
}

export default usePermission
