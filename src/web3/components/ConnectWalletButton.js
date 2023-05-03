import React, { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { useRoomContext } from '@/hooks/RoomContext'
import { ConnectKitButton } from 'connectkit'
import { WALLET } from '@/core/components/wallet'

const ConnectWalletButton = ({
  label = null,
}) => {
  const { agentId, Profile, Wallet } = useRoomContext()
  const { isConnected, address } = useAccount()

  useEffect(() => {
    const _connectedAddress = (isConnected && address) ? address : null
    Wallet.connectedWallet(WALLET.Ethereum, _connectedAddress)
  }, [isConnected, address])

  return (
    <div>
      <ConnectKitButton />
    </div>
  )
}

export default ConnectWalletButton
