import { useState, useEffect } from 'react'
import {
  HStack,
  VStack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import useRoom from '@/hooks/useRoom'
import useProfile from '@/hooks/useProfile'
import useVerida from '@/hooks/useVerida'
import ModalProfile from '@/components/ModalProfile'

export const Avatar = ({
  name=null,
  avatarUri=null,
  width = 60,
}) => {

  // const defaultAvatarUrl = '/nosignal_noise.gif'
  const defaultAvatarUrl = '/avatar.png'

  return (
    <VStack>
      <img src={avatarUri ?? defaultAvatarUrl} width={width} height={width} />
      {name &&
        <Text className='NoMargin'>{name}</Text>
      }
    </VStack>
  )
}


export const AvatarButton = () => {
  const { agentId } = useRoom()
  const { profileName, profileAvatarUrl } = useProfile(agentId)

  const { veridaIsConnecting, veridaProfileName, veridaAvatarUri } = useVerida()

  const disclosure = useDisclosure()

  const _openModal = () => {
    if (!veridaIsConnecting) {
      disclosure.onOpen()
    }
  }

  return (
    <div className='AvatarContainer' onClick={() => _openModal()}>
      <Avatar name={veridaProfileName ?? profileName ?? '...'} avatarUri={veridaAvatarUri ?? profileAvatarUrl} />
      <ModalProfile disclosure={disclosure} />
    </div>
  )
}

