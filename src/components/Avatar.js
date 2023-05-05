import { useEffect } from 'react'
import {
  HStack,
  VStack,
  Spacer,
  Text,
  Image,
} from '@chakra-ui/react'
import useProfile from '@/hooks/useProfile'
import useTexture from '@/hooks/useTexture'
import { textureData } from '@/core/texture-data'

const Avatar = ({
  isLoading = false,
  name = null,
  avatarUri = null,
  spriteUrl = null,
  externalProfileUrl = null,
  width = 50,
}) => {
  const { walletType } = useProfile()
  const { sprite } = useTexture(spriteUrl ?? null)

  const _onClick = () => {
    if (externalProfileUrl) {
      window.open(externalProfileUrl, '_blank', 'noreferrer')
    }
  }
  // const defaultAvatarUrl = '/nosignal_noise.gif'
  const _defaultAvatarUrl = '/icons/avatar.png'

  const _avatarStyle = {
    width: `${width}px`,
    height: `${width}px`,
    cursor: externalProfileUrl ? 'pointer' : undefined,
    // border: `1px solid #fff3`,
  }

  const _logoWidth = Math.min(width / 2, 40)

  return (
    <HStack>
      <Spacer />
      
      <VStack>
        <div style={_avatarStyle} onClick={() => _onClick()}>
          {isLoading ? <img src={_defaultAvatarUrl} width={width} height={width} alt='avatar' />
            : avatarUri ? <img src={avatarUri ?? _defaultAvatarUrl} width={width} height={width} alt='avatar' />
              : sprite ? <img src={spriteUrl} style={sprite.imgStyle} alt='sprite' />
                : <img src={_defaultAvatarUrl} width={width} height={width} alt='avatar' />
          }
        </div>
        {name &&
          <Text className='NoMargin'>{isLoading ? '...' : name}</Text>
        }
      </VStack>

      {walletType &&
        <VStack h={`calc(${width}px + 1em)`}>
          <Image
            src={textureData[walletType].src}
            alt='connected'
            w={`${_logoWidth}px`}
            h={`${_logoWidth}px`}
          />
          <Spacer />
        </VStack>
      }

      <Spacer />
    </HStack>
  )
}

export {
  Avatar,
}
