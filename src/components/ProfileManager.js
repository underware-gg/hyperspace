import React, { useEffect } from 'react'
import { useAccount } from 'wagmi'
import {
  HStack,
  VStack,
  Spacer,
  Text,
  Image,
  useDisclosure,
} from '@chakra-ui/react'
import { useVeridaContext, VeridaActions } from '@/hooks/VeridaContext'
import { RoomProvider, useRoomContext } from '@/hooks/RoomContext'
import { useRoom } from '@/hooks/useRoom'
import useProfile from '@/hooks/useProfile'
import ModalProfile from '@/components/ModalProfile'
import { Avatar } from '@/components/Avatar'
import { WALLET } from '@/core/components/wallet'

const ProfileManager = () => {
  return (
    <RoomProvider>
      <ProfileDetector />
      <AvatarButton />
    </RoomProvider>
  )
}

export default ProfileManager


const ProfileDetector = ({
}) => {
  const { Wallet } = useRoomContext()

  //
  // Verida
  const { veridaIsConnected, didAddress } = useVeridaContext()
  useEffect(() => {
    const _connectedAddress = (veridaIsConnected && didAddress) ? didAddress : null
    Wallet?.connectedWallet(WALLET.Verida, _connectedAddress)
  }, [Wallet, veridaIsConnected, didAddress])

  //
  // Ethereum Wallet
  const { isConnected, address } = useAccount()
  useEffect(() => {
    const _connectedAddress = (isConnected && address) ? address : null
    Wallet?.connectedWallet(WALLET.Ethereum, _connectedAddress)
  }, [Wallet, isConnected, address])

  return null
}



const AvatarButton = () => {
  const { profileName, profileAvatarUrl, profileCharacterUrl } = useProfile()
  const {
    veridaIsConnecting,
    veridaProfileName,
    veridaAvatarUri,
    requestedSignIn,
    dispatchVerida,
  } = useVeridaContext()

  // useRoom() will dispatch to RoomContext when the room is loaded
  useRoom({})

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

