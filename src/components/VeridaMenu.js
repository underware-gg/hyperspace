import React from 'react'
import { HStack, Spacer } from '@chakra-ui/react'
import Button from '@/components/Button'
import useVerida from '@/hooks/useVerida'
import usePermission from '@/hooks/usePermission'
import { useRoomContext } from '@/hooks/RoomContext'

const VeridaMenu = () => {
  const { remoteStore, clientRoom, slug } = useRoomContext()
  const { veridaIsConnected, veridaProfile } = useVerida()
  const { canEdit } = usePermission('world')

  const _saveRoomData = async (slug) => {
    if (!clientRoom) return
    const snapshotOps = clientRoom.getSnapshotOps()
    const { VeridaUser } = (await import('@/core/verida'))
    await VeridaUser.saveRoom(slug, snapshotOps)
  }

  const _restoreRoomData = async () => {
    const { VeridaUser } = (await import('@/core/verida'))
    const snapshot = await VeridaUser.getRoom(slug)

    if (snapshot) {
      const json = JSON.parse(snapshot)

      for (const op of json) {
        if (op.pathIndex === 0) {
          const { type, key, value } = op
          remoteStore.setDocument(type, key, value)
        }
      }
    } else {
      console.log('No room data found')
    }
  }

  return (
    <HStack>
      {veridaIsConnected &&
        <>
          <Spacer />
          <Button disabled={!canEdit} variant='outline' size='sm' onClick={async () => await _saveRoomData(slug)}>
            Save Room Data
          </Button>
          <Button disabled={!canEdit} variant='outline' size='sm' onClick={async () => await _restoreRoomData(slug)}>
            Restore Room Data
          </Button>
        </>
      }
    </HStack>

  )
}

export default VeridaMenu
