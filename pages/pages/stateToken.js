import { useMemo, useState } from 'react'
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
  Input,
} from '@chakra-ui/react'
import { useHyperboxStateContract } from '@/web3/hooks/useHyperboxContract'
import { useHyperboxState } from '@/web3/hooks/useHyperboxState'
import { useTotalSupply } from '@/web3/hooks/useTotalSupply'
import { useBalanceOf } from '@/web3/hooks/useBalanceOf'
import { useWrite } from '@/web3/hooks/useWrite'
import Layout from '@/components/Layout'
import Button from '@/components/Button'

const StateTokenPage = () => {
  const { chain } = useNetwork()
  const { address, isConnected, isConnecting, isDisconnected } = useAccount()
  const { contractAddress, contractName, abi } = useHyperboxStateContract()
  const { totalSupply } = useTotalSupply({ contractAddress, abi })
  const { balanceOf } = useBalanceOf(address, { contractAddress, abi })

  const states = useMemo(() => {
    let result = []
    for (let tokenId = 1; tokenId <= totalSupply; ++tokenId) {
      result.push(<GetState key={`state_${tokenId}`} tokenId={tokenId} />)
    }
    return result
  }, [totalSupply])

  return (
    <Layout height='100vh'>
      <VStack align='stretch' w='100%' alignItems='center'>
        <HStack>
          <ConnectKitButton />
          <Spacer />
          <div suppressHydrationWarning>
            {isDisconnected && <div>Disconnected</div>}
            {isConnecting && <div>Connecting…</div>}
            {isConnected && <div>Network: {chain.name}</div>}
          </div>
        </HStack>

        <div>Account: {address}</div>
        <div>Contract: {contractName} / {contractAddress}</div>
        <HStack>
          <div>Minted Count: {totalSupply}</div>
          <div>You own: {balanceOf}</div>
        </HStack>
        <hr />

        <Mint />
        <hr />

        <SetState />
        <hr />

        {states}

      </VStack>
    </Layout>
  )
}

export default StateTokenPage


const Mint = () => {
  const [data, setData] = useState('')

  const { address } = useAccount()
  const { contractAddress, abi } = useHyperboxStateContract()
  const { write, hash, isLoading, isProcessing, isSuccess, isError, error } = useWrite('mint', [address, data], { contractAddress, abi })

  return (
    <HStack>
      <Input
        placeholder='Data'
        value={data}
        onChange={(e) => setData(e.target.value)}
        w={300}
      />
      <Button disabled={!write || isLoading || isProcessing} onClick={() => write?.()}>
        Mint
      </Button>
      {isLoading && <div>Approve Wallet...</div>}
      {isProcessing && <div>Processing... [{hash}]</div>}
      {isSuccess && <div>Success!</div>}
      {isError && <div> Error: {error}</div>}
    </HStack>
  )
}

const SetState = () => {
  const [data, setData] = useState('')

  const [tokenId, setTokenId] = useState('')
  const { contractAddress, abi } = useHyperboxStateContract()
  const { write, isLoading, isProcessing, isSuccess, isError, error } = useWrite('setState', [tokenId, data], { contractAddress, abi })

  return (
    <HStack>
      <Input
        placeholder='Token Id'
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        w={120}
      />
      <Input
        placeholder='Data'
        value={data}
        onChange={(e) => setData(e.target.value)}
        w={300}
      />
      <Button disabled={!write || isLoading || isProcessing} onClick={() => write?.()}>
        Set State
      </Button>

      {isLoading && <div>Approve Wallet...</div>}
      {isProcessing && <div>Processing...</div>}
      {isSuccess && <div>Success!</div>}
      {isError && <div>Error: {error}</div>}
    </HStack>
  )
}

const GetState = ({ tokenId }) => {
  const { state, isLoading, isSuccess, isError, error } = useHyperboxState(tokenId)
  return (
    <HStack>
      <div>{tokenId}:</div>
      {isLoading && <div>Loading...</div>}
      {isSuccess && <div className='Code'>{state}</div>}
      {isError && <div>Error: {error}</div>}
    </HStack>
  )
}


