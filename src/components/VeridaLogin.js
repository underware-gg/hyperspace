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

const VeridaAvatar = () => {
  const { veridaProfile, did, didAddress } = useVerida()

  const avatarUri = veridaProfile?.avatarUri ?? '/nosignal_noise.gif'
  const avatarName = veridaProfile?.name ?? null

  const _disconnect = async () => {
    const { VeridaUser } = (await import('src/core/networking/verida'))
    await VeridaUser.disconnect()
  }

  const confirmDisclosure = useConfirmDisclosure({
    header: 'Verida',
    message: <>Disconnect {veridaProfile.name}?<br />{did}</>,
    confirmLabel: 'Disconnect',
    onConfirm: _disconnect,
  })

  return (
    <VStack style={{ cursor: 'pointer' }} onClick={() => confirmDisclosure.openConfirmDialog()}>
      <img src={avatarUri} width='40' height='40' />
      <Text className='NoMargin'>{avatarName}</Text>
      <DialogConfirm confirmDisclosure={confirmDisclosure} />
    </VStack>
  )
}
 
const VeridaLogin = () => {
  const { veridaIsConnected, veridaIsInitializing } = useVerida()
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
        <VeridaAvatar />
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
