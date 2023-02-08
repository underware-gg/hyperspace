import { useState } from 'react'
import {
  HStack,
  VStack,
  Text,
} from '@chakra-ui/react'
import useVerida from '@/hooks/useVerida'
import Button from '@/components/Button'
import { DialogConfirm, useConfirmDisclosure } from '@/components/DialogConfirm'
import { ModalPermissions, usePermissionsDisclosure } from '@/components/ModalPermissions'

export const VeridaAvatar = ({
  profile,
}) => {
  const avatarUri = profile?.avatarUri ?? profile?.avatar?.uri ?? '/nosignal_noise.gif'
  const avatarName = profile?.name ?? null

  return (
    <VStack>
      <img src={avatarUri} width='40' height='40' />
      <Text className='NoMargin'>{avatarName}</Text>
    </VStack>
  )
}

export const VeridaAvatarDisconnect = ({
  profile,
}) => {
  const _disconnect = async () => {
    const { VeridaUser } = (await import('src/core/networking/verida'))
    await VeridaUser.disconnect()
  }

  const confirmDisclosure = useConfirmDisclosure({
    header: 'Verida',
    message: <>Disconnect {profile.name}?</>,
    confirmLabel: 'Disconnect',
    onConfirm: _disconnect,
  })

  return (
    <div style={{ cursor: 'pointer' }} onClick={() => confirmDisclosure.openConfirmDialog()}>
      <VeridaAvatar profile={profile} />
      <DialogConfirm confirmDisclosure={confirmDisclosure} />
    </div>
  )
}

const VeridaLogin = () => {
  const { veridaIsConnected, veridaIsInitializing, veridaProfile, did } = useVerida()
  const [isConnecting, setIsConnecting] = useState(false)
  const permissionsDisclosure = usePermissionsDisclosure('world')

  const _connect = async () => {
    const { VeridaUser } = (await import('src/core/networking/verida'))

    console.log(`connect...`)
    setIsConnecting(true);
    const success = await VeridaUser.connect()
    setIsConnecting(false);
    console.log(`connect status:`, success)

    // setIsConnecting(true);
    // VeridaUser.connect().then(() => {
    //   setIsConnecting(false);
    //   console.warn(`Verida connected?`);
    // }).catch((error) => {
    //   setIsConnecting(false);
    //   console.warn(`Verida connect exception:`, error);
    // });
  }

  const disabled = (veridaIsInitializing || isConnecting)

  return (
    <HStack>
      <Button disabled={disabled} size='sm' onClick={() => permissionsDisclosure.openPermissions()}>
        Permissions
      </Button>
      {veridaIsConnected &&
        <VeridaAvatarDisconnect profile={veridaProfile} />
      }
      {!veridaIsConnected &&
        <Button disabled={disabled} size='sm' onClick={() => _connect()}>
          {isConnecting ? 'Connecting' : 'Connect'}
        </Button>
      }
      <ModalPermissions type='Room' permissionsDisclosure={permissionsDisclosure} />
    </HStack>
  )
}

export default VeridaLogin
