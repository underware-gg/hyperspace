import { useState, useEffect } from 'react'
import {
  HStack,
  VStack,
  Text,
} from '@chakra-ui/react'
import { useDocument } from '@/hooks/useDocument'
import useRoom from '@/hooks/useRoom'
import useProfile from '@/hooks/useProfile'
import useVerida from '@/hooks/useVerida'
import Button from '@/components/Button'
import { DialogConfirm, useConfirmDisclosure } from '@/components/DialogConfirm'
import { ModalSettings, useSettingsDisclosure } from '@/components/ModalSettings'

export const Avatar = ({
  name,
  imageUrl,
}) => {
  const { agentId } = useRoom()
  const { profileName, profileImageUrl, defaultImageUrl } = useProfile(agentId)
  const [playerName, setPlayerName] = useState(null)
  const [playerImageUrl, setPlayerImageUrl] = useState(null)

  useEffect(() => {
    if (!name) {
      setPlayerName(profileName)
    }
    if (!imageUrl) {
      // setPlayerImageUrl(profileImageUrl)
      setPlayerImageUrl(defaultImageUrl)
    }

  }, [agentId, profileName, profileImageUrl])

  return (
    <VStack>
      <img src={imageUrl ?? playerImageUrl} width='40' height='40' />
      <Text className='NoMargin'>{name ?? playerName}</Text>
    </VStack>
  )
}


export const VeridaAvatar = ({
  veridaProfile,
}) => {
  const _disconnect = async () => {
    const { VeridaUser } = (await import('src/core/networking/verida'))
    await VeridaUser.disconnect()
  }

  const confirmDisclosure = useConfirmDisclosure({
    header: 'Verida',
    message: <>Disconnect {veridaProfile.name}?</>,
    confirmLabel: 'Disconnect',
    onConfirm: _disconnect,
  })

  const avatarUri = veridaProfile?.avatarUri ?? veridaProfile?.avatar?.uri ?? '/nosignal_noise.gif'
  const avatarName = veridaProfile?.name ?? '...'

  return (
    <div style={{ cursor: 'pointer' }} onClick={() => confirmDisclosure.openConfirmDialog()}>
      <Avatar name={avatarName} imageUrl={avatarUri} />
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
      {(veridaIsInitializing || veridaIsConnected) ?
        <>
          <Button disabled={disabled} size='sm' onClick={() => _inviteFriend()}>
            Invite Friend
          </Button>
          <VeridaAvatar veridaProfile={veridaProfile} />
        </>
        :
        <>
          <Button disabled={disabled} size='sm' onClick={() => _connect()}>
            {isConnecting ? 'Connecting' : 'Connect'}
          </Button>
          <Avatar />
        </>
      }
      <ModalSettings type='Room' settingsDisclosure={settingsDisclosure} />
    </HStack>
  )
}

export default VeridaLogin
