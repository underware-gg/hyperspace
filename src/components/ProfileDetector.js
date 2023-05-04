import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useVeridaContext } from '@/hooks/VeridaContext'
import { useRoomContext } from '@/hooks/RoomContext'
import { WALLET } from '@/core/components/wallet'

export const ProfileDetector = ({
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

