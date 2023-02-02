import { useState } from 'react'
import { Text, VStack } from '@chakra-ui/react'
import useRoom from '@/hooks/useRoom'
import useVerida from '@/hooks/useVerida'
import Button from '@/components/Button'

const VeridaAvatar = () => {
  const { agentId } = useRoom();
  const { veridaProfile } = useVerida(agentId)

  const avatarUri = veridaProfile?.avatarUri ?? '/nosignal_noise.gif'
  const avatarName = veridaProfile?.name ?? null

  const _disconnect = async () => {
    const { VeridaUser } = (await import('src/core/networking/verida'))

    await VeridaUser.disconnect()

    // VeridaUser.disconnect().then(() => {
    //   console.warn(`Verida disconnected`);
    // }).catch((error) => {
    //   console.warn(`Verida disconnect exception:`, error);
    // });
  }

  return (
    <VStack onClick={() => _disconnect()}>
      <img src={avatarUri} width='40' height='40' />
      <Text className='NoMargin'>{avatarName}</Text>
    </VStack>
  )
}

const VeridaLogin = () => {
  const { agentId } = useRoom();
  const { veridaIsConnected, veridaIsInitializing } = useVerida(agentId)
  const [isConnecting, setIsConnecting] = useState(false)

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

  return (
    <div>
      {veridaIsConnected == true
        ? <VeridaAvatar />
        : <Button disabled={veridaIsInitializing || isConnecting} size='sm' onClick={() => _connect()}>
          {isConnecting ? 'Connecting' : 'Connect'}
        </Button>
      }
    </div>
  )
}

export default VeridaLogin
