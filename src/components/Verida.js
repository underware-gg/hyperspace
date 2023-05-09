import React, { useState } from 'react'
import {
  VStack, HStack,
  Spacer,
} from '@chakra-ui/react'
import { useVeridaContext } from '@/hooks/VeridaContext'
import { useRoomContext } from '@/hooks/RoomContext'
import Button from '@/components/Button'
import { useSlugs } from '@/hooks/useSlugs'

export const VeridaConnectMenu = ({
  disconnectButton = false,
  inviteFriendButton = false,
  connectLabel = 'Sign In with Verida',
  disconnectLabel = 'Disconnect Verida',
}) => {
  const { slug } = useSlugs()
  const {
    download, connect, disconnect, inviteFriend,
    veridaIsConnected, veridaIsConnecting,
  } = useVeridaContext()

  const _disabled = (veridaIsConnecting)

  return (
    <HStack>
      {!veridaIsConnected &&
        <>
          <Button disabled={_disabled} size='sm' onClick={() => connect()}>
            {veridaIsConnecting ? 'Connecting...' : connectLabel}
          </Button>
          <Button disabled={_disabled} size='sm' variant='outline' onClick={() => download()}>
            Download Verida
          </Button>
        </>
      }
      {veridaIsConnected && disconnectButton &&
        <Button disabled={_disabled} size='sm' onClick={() => disconnect()}>
          {disconnectLabel}
        </Button>
      }
      {veridaIsConnected && inviteFriendButton &&
        <Button disabled={_disabled} size='sm' variant='outline' onClick={() => inviteFriend(slug)}>
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
  onSaved = (success) => { },
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
      {label}
    </Button>
  )
}

export const VeridaRestoreButton = ({
  id = null,
  disabled = false,
  variant = null,
  label = 'Verida Restore',
  onRestoring = () => { },
  onRestored = (is, data) => { },
}) => {
  const { veridaIsConnected, restoreData } = useVeridaContext()
  const [isRestoring, setIsRestoring] = useState(false)

  const _restoreData = async () => {
    setIsRestoring(true)
    onRestoring()
    const data = await restoreData(id)
    onRestored(id, data)
    setIsRestoring(false)
  }

  return (
    <Button disabled={disabled || !veridaIsConnected || !id || isRestoring} variant={variant} size='sm' onClick={async () => await _restoreData()}>
      {label}
    </Button>
  )
}



//
// TODO: REMOVE ME!!
//
import usePermission from '@/hooks/usePermission'
export const VeridaMenu = () => {
  const { slug } = useSlugs()
  const { remoteStore, clientRoom } = useRoomContext()
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
