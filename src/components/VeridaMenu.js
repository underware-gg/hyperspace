import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { HStack, Spacer } from '@chakra-ui/react'
import Button from '@/components/Button'
import useVerida from '@/hooks/useVerida'
import usePermission from '@/hooks/usePermission'
import { getLocalStore, getRemoteStore } from '@/core/singleton'
import * as ClientRoom from '@/core/networking'

const VeridaMenu = () => {
  const { veridaIsConnected, veridaProfile } = useVerida()
  const { canEdit } = usePermission('world')

  const router = useRouter()
  const { slug } = router.query

  const _saveRoomData = async (slug) => {
    const room = ClientRoom.get()
    if (room === null) {
      return
    }
    const snapshotOps = room.getSnapshotOps()
    const { VeridaUser } = (await import('@/core/verida'))
    await VeridaUser.saveRoom(slug, snapshotOps)
  }

  const _restoreRoomData = async () => {
    const room = ClientRoom.get()
    if (room === null) {
      return
    }

    const { VeridaUser } = (await import('@/core/verida'))
    const snapshot = await VeridaUser.getRoom(room.slug)

    if (snapshot) {
      const json = JSON.parse(snapshot)
      const remoteStore = getRemoteStore()

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
