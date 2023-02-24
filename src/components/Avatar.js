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
import useTexture from '@/hooks/useTexture'
import ModalProfile from '@/components/ModalProfile'

export const Avatar = ({
  isLoading = false,
  name = null,
  avatarUri = null,
  spriteUrl = null,
  externalProfileUrl = null,
  width = 50,
}) => {
  const { sprite } = useTexture(spriteUrl ?? null)

  const _onClick = () => {
    if (externalProfileUrl) {
      window.open(externalProfileUrl, '_blank', 'noreferrer')
    }
  }
  // const defaultAvatarUrl = '/nosignal_noise.gif'
  const defaultAvatarUrl = '/avatar.png'

  const avatarStyle = {
    width: `${width}px`,
    height: `${width}px`,
    cursor: externalProfileUrl ? 'pointer' : undefined,
    // border: `1px solid #fff3`,
  }

  return (
    <VStack>
      <div style={avatarStyle} onClick={() => _onClick()}>
        {isLoading ? <img src={defaultAvatarUrl} width={width} height={width} alt='avatar' />
          : avatarUri ? <img src={avatarUri ?? defaultAvatarUrl} width={width} height={width} alt='avatar' />
            : sprite ? <img src={spriteUrl} style={sprite.imgStyle} alt='sprite' />
              : <img src={defaultAvatarUrl} width={width} height={width} alt='avatar' />
        }
      </div>
      {name &&
        <Text className='NoMargin'>{isLoading ? '...' : name}</Text>
      }
    </VStack>
  )
}


export const AvatarButton = () => {
  const { agentId } = useRoom()
  const { profileName, profileAvatarUrl, profileCharacterUrl } = useProfile(agentId)
  const { veridaIsConnecting, veridaProfileName, veridaAvatarUri } = useVerida()

  const disclosure = useDisclosure()

  const _openModal = () => {
    if (!veridaIsConnecting) {
      disclosure.onOpen()
    }
  }

  return (
    <div className='AvatarContainer' onClick={() => _openModal()}>
      <Avatar 
        isLoading={veridaIsConnecting}
        name={veridaProfileName ?? profileName ?? '...'}
        avatarUri={veridaAvatarUri ?? profileAvatarUrl}
        spriteUrl={profileCharacterUrl}
      />
      <ModalProfile disclosure={disclosure} />
    </div>
  )
}

