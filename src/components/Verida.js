import React, { useState } from 'react'
import {
  VStack, HStack,
  Spacer,
} from '@chakra-ui/react'
import { useVeridaContext } from '@/hooks/VeridaContext'
import { useRoomContext } from '@/hooks/RoomContext'
import Button from '@/components/Button'

export const VeridaConnectMenu = ({
  disconnectButton = false,
  inviteFriendButton = false,
}) => {
  const { slug } = useRoomContext()
  const {
    download, connect, disconnect, inviteFriend,
    veridaIsConnected, veridaIsConnecting,
  } = useVeridaContext()

  const _disabled = (veridaIsConnecting)

  return (
    <HStack>
      {!veridaIsConnected &&
      <>
        <Button disabled={_disabled} size='sm' onClick={() => download()}>
          Download Verida
        </Button>
        <Button disabled={_disabled} size='sm' onClick={() => connect()}>
          {veridaIsConnecting ? 'Connecting' : 'Connect Verida'}
        </Button>
      </>
      }
      {veridaIsConnected && disconnectButton &&
        <Button disabled={_disabled} size='sm' onClick={() => disconnect()}>
          Disconnect Verida
        </Button>
      }
      {veridaIsConnected && inviteFriendButton &&
        <Button disabled={_disabled} size='sm' onClick={() => inviteFriend(slug)}>
          Invite Friend
        </Button>
      }
    </HStack>
  )
}

export const VeridaStoreButton = ({
  id = null,
  data = null,
  disabled = false,
  variant = null,
  label = 'Verida Save',
  onSaving = () => { },
  onSaved = (success) => {},
  children = null,
}) => {
  const { veridaIsConnected, saveData } = useVeridaContext()
  const [isSaving, setIsSaving] = useState(false)

  const _saveData = async () => {
    setIsSaving(true)
    onSaving()
    const success = await saveData(id, data)
    onSaved(success)
    setIsSaving(false)
  }

  return (
    <Button disabled={disabled || !veridaIsConnected || !id || !data || isSaving} variant={variant} size='sm' onClick={async () => await _saveData()}>
      {children ?? label}
    </Button>
  )
}




//
// TODO: REMOVE ME!!
//
import usePermission from '@/hooks/usePermission'
export const VeridaMenu = () => {
  const { remoteStore, clientRoom, slug } = useRoomContext()
  const { veridaIsConnected, veridaProfile, saveData, getData } = useVeridaContext()
  const { canEdit } = usePermission('world')

  const _saveDataData = async (slug) => {
    if (!clientRoom) return
    const snapshotOps = clientRoom.getSnapshotOps()
    await saveData(slug, snapshotOps)
  }

  const _restoreRoomData = async () => {
    const snapshot = await getData(slug)

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
        <Button disabled={!canEdit} variant='outline' size='sm' onClick={async () => await _saveDataData(slug)}>
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
