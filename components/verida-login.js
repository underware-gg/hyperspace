import { useEffect } from 'react'
import { Text, VStack } from '@chakra-ui/react'
import useRoom from 'hooks/use-room'
import useVerida from 'hooks/use-verida'
import Button from 'components/button'

const VeridaAvatar = () => {
  const { agentId } = useRoom();
  const { veridaConnected, veridaProfile } = useVerida(agentId)

  const avatarUri = veridaProfile?.avatarUri ?? '/nosignal_noise.gif'
  const avatarName = veridaProfile?.name ?? null

  const _disconnect = async () => {
    const VeridaUser = (await import('core/networking/verida')).VeridaUser
    await VeridaUser.disconnect()
  }

  return (
    <VStack onClick={() => _disconnect()}>
      <img src={avatarUri} width="40" height="40" />
      <Text className='NoMargin'>{avatarName}</Text>
    </VStack>
  )
}

const VeridaLogin = () => {
  const { agentId } = useRoom();
  const { veridaConnected } = useVerida(agentId)

  const _connect = async () => {
    const VeridaUser = (await import('core/networking/verida')).VeridaUser
    await VeridaUser.connect()
  }

  return (
    <div>
      {veridaConnected == true
        ? <VeridaAvatar />
        : <Button size='sm' onClick={() => _connect()}>
          Connect
        </Button>
      }
    </div>
  )
}

export default VeridaLogin
