import { useState } from 'react'
import {
  HStack,
  VStack,
  Text,
} from '@chakra-ui/react'
import useVerida from '@/hooks/useVerida'
import Button from '@/components/Button'
import { DialogConfirm, useConfirmDisclosure } from '@/components/DialogConfirm'
import { ModalSettings, useSettingsDisclosure } from '@/components/ModalSettings'

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
  const settingsDisclosure = useSettingsDisclosure('world')

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


  const disabled = (veridaIsInitializing || isConnecting)

  return (
    <HStack>
      <Button disabled={disabled} size='sm' onClick={() => settingsDisclosure.openSettings()}>
        Settings
      </Button>
      {veridaIsConnected &&
        <>
          <Button size='sm' onClick={() => _inviteFriend()}>
            Invite Friend
          </Button>
          <VeridaAvatarDisconnect profile={veridaProfile} />
        </>
      }
      {!veridaIsConnected &&
        <Button disabled={disabled} size='sm' onClick={() => _connect()}>
          {isConnecting ? 'Connecting' : 'Connect'}
        </Button>
      }
      <ModalSettings type='Room' settingsDisclosure={settingsDisclosure} />
    </HStack>
  )
}

export default VeridaLogin
