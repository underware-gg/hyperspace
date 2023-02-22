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
  name = null,
  avatarUri = null,
  spriteUrl = null,
  width = 60,
}) => {
  const { sprite } = useTexture(spriteUrl ?? null)

  // const defaultAvatarUrl = '/nosignal_noise.gif'
  const defaultAvatarUrl = '/avatar.png'

  const avatarStyle = {
    width: `${width}px`,
    height: `${width}px`,
    // border: `1px solid #fff3`,
  }

  return (
    <VStack>
      <div style={avatarStyle}>
        {avatarUri ? <img src={avatarUri ?? defaultAvatarUrl} width={width} height={width} alt='avatar' />
          : sprite ? <img src={spriteUrl} style={sprite.imgStyle} alt='sprite' />
            : <img src={defaultAvatarUrl} width={width} height={width} alt='avatar' />
        }
      </div>
      {name &&
        <Text className='NoMargin'>{name}</Text>
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
        name={veridaProfileName ?? profileName ?? '...'}
        avatarUri={veridaAvatarUri ?? profileAvatarUrl}
        spriteUrl={profileCharacterUrl}
      />
      <ModalProfile disclosure={disclosure} />
    </div>
  )
}

