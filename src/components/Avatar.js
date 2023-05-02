import { useState, useEffect, useContext } from 'react'
import {
  HStack,
  VStack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { useVeridaContext, VeridaActions, VeridaContext } from '@/hooks/VeridaContext'
import useProfile from '@/hooks/useProfile'
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
  const { profileName, profileAvatarUrl, profileCharacterUrl } = useProfile()
  const {
    veridaIsConnecting,
    veridaProfileName,
    veridaAvatarUri,
    requestedSignIn,
    dispatchVerida,
  } = useVeridaContext()

  const disclosure = useDisclosure()

  const _openModal = () => {
    if (!veridaIsConnecting) {
      disclosure.onOpen()
    }
  }

  useEffect(() => {
    if (requestedSignIn) {
      dispatchVerida(VeridaActions.setRequestSignIn, false)
      disclosure.onOpen()
    }
  }, [requestedSignIn])

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

