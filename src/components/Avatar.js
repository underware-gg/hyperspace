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
  width = 60,
  displayName = false
}) => {
  const { agentId } = useRoom()
  const { profileName, profileImageUrl, defaultImageUrl } = useProfile(agentId)

  const { avatarName, avatarUri } = useVerida()

  const [playerName, setPlayerName] = useState(null)
  const [playerImageUrl, setPlayerImageUrl] = useState(null)

  useEffect(() => {
    setPlayerName(avatarName ?? profileName)
    setPlayerImageUrl(avatarUri ?? defaultImageUrl)
  }, [agentId, profileName, avatarName, avatarUri])

  return (
    <VStack>
      <img src={playerImageUrl} width={width} height={width} />
      {displayName &&
        <Text className='NoMargin'>{playerName}</Text>
      }
    </VStack>
  )
}


export const AvatarButton = () => {
  const { veridaIsConnecting } = useVerida()

  const disclosure = useDisclosure()

  const _openModal = () => {
    if (!veridaIsConnecting) {
      disclosure.onOpen()
    }
  }

  return (
    <div className='AvatarContainer' onClick={() => _openModal()}>
      <Avatar displayName />
      <ModalProfile disclosure={disclosure} />
    </div>
  )
}

