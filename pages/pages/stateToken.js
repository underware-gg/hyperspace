import { useState } from 'react'
import Link from 'next/link'
import { ConnectKitButton } from 'connectkit'
import {
  useAccount,
  useNetwork,
} from 'wagmi'
import {
  HStack,
  VStack,
  Spacer,
} from '@chakra-ui/react'
import { useHyperboxStateContract } from '@/web3/hooks/useHyperboxContract'
import { useTotalSupply } from '@/web3/hooks/useTotalSupply'
import { useBalanceOf } from '@/web3/hooks/useBalanceOf'
import Layout from '@/components/Layout'

const StateTokenPage = () => {
  const { chain } = useNetwork()
  const { address, isConnected, isConnecting, isDisconnected } = useAccount()
  const { contractAddress, contractName, abi } = useHyperboxStateContract()
  const { totalSupply } = useTotalSupply({ contractAddress, abi })
  const { balanceOf } = useBalanceOf(address, { contractAddress, abi })

  return (
    <Layout height='100vh'>
      <VStack align='stretch' w='100%' alignItems='center'>
        <HStack>
          <ConnectKitButton />
          <Spacer />
          <div suppressHydrationWarning>
            {isDisconnected && <div>Disconnected</div>}
            {isConnecting && <div>Connecting…</div>}
            {isConnected && <div>{chain.name}: {address}</div>}
          </div>
        </HStack>

        <div>Contract: {contractName} / {contractAddress}</div>
        <HStack>
          <div>Minted Count: {totalSupply}</div>
          <div>You own: {balanceOf}</div>
        </HStack>
        <hr />

      </VStack>
    </Layout>
  )
}

export default StateTokenPage
