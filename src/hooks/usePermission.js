import { useMemo } from 'react'
import useDocument from '@/hooks/useDocument'
import useVerida from '@/hooks/useVerida'

const usePermission = (id) => {
  const { veridaIsConnected, veridaProfile, did, didAddress } = useVerida()

  const permission = useDocument('permission', id)
  // console.log(`permission:`, id, permission)

  const isOwner = useMemo(() => (veridaIsConnected && permission?.owner == didAddress), [veridaIsConnected, permission])
  const canView = useMemo(() => (isOwner || !permission || permission.visible), [isOwner, permission])
  const canEdit = useMemo(() => (isOwner || !permission || permission.public), [isOwner, permission])
  
  return {
    permission,
    isOwner,
    canView,
    canEdit,
  }
}

export default usePermission
