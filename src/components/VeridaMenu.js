import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { HStack, Spacer } from '@chakra-ui/react'
import Button from '@/components/Button'
import useRoom from '@/hooks/useRoom'
import useVerida from '@/hooks/useVerida'
import { getLocalStore, getRemoteStore } from '@/core/singleton'
import * as ClientRoom from '@/core/networking'

const VeridaMenu = () => {
  const { agentId } = useRoom();
  const { veridaIsConnected, veridaProfile } = useVerida(agentId)
  const router = useRouter()
  const { slug } = router.query

  const _inviteFriend = async () => {
    const recipientDid = window.prompt('DID to invite', 'did:vda:....')
    if (!recipientDid) {
      return
    }
    const subject = `Hyperbox invite!`
    const message = `Join me in ${slug} on Hyperbox`
    // @todo: Get app URL from next.js
    const url = `http://192.168.68.124:3000/${slug}`
    const text = `Open (${slug})`
    await VeridaUser.sendMessage(recipientDid, subject, message, url, text)
  }

  const _saveRoomData = async (slug) => {
    const room = ClientRoom.get()
    if (room === null) {
      return
    }
    const snapshotOps = room.getSnapshotOps()
    const { VeridaUser } = (await import('src/core/networking/verida'))
    await VeridaUser.saveRoom(slug, snapshotOps)
  }

  const _restoreRoomData = async () => {
    const room = ClientRoom.get()
    if (room === null) {
      return
    }

    const { VeridaUser } = (await import('src/core/networking/verida'))
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

  const _lastTweet = async () => {
    const { VeridaUser } = (await import('src/core/networking/verida'))
    await VeridaUser.setDocumentToLastTweet()
  }

  return (
    <HStack>
      {veridaIsConnected &&
        <>
          <Button variant='outline' size='sm' onClick={() => _inviteFriend()}>
            Invite Friend
          </Button>
          <Spacer />
          <Button variant='outline' size='sm' onClick={async () => await _saveRoomData(slug)}>
            Save Room Data
          </Button>
          <Button variant='outline' size='sm' onClick={async () => await _restoreRoomData(slug)}>
            Restore Room Data
          </Button>
        </>
      }
    </HStack>

  )
}

export default VeridaMenu