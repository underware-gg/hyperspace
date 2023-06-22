import React, { useMemo, useState } from 'react'
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
import { useBalanceOf } from '@/web3/hooks/useBalance'
import Layout from '@/components/Layout'
import MintButton from '@/web3/components/MintButton'
import UpdateButton from '@/web3/components/UpdateButton'
import StateSelector from '@/web3/components/StateSelector'

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
    <Layout>
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

        <div>Account: <span className='Code'>{address}</span></div>
        <div>Contract: {contractName} / <span className='Code'>{contractAddress}</span></div>
        <HStack>
          <div>Minted Count: <span className='Code'>{totalSupply}</span></div>
          <div>You own: <span className='Code'>{balanceOf}</span></div>
        </HStack>
        <hr />

        <MintForm />
        <hr />

        <UpdateForm />
        <hr />

        {states}

      </VStack>
    </Layout>
  )
}

export default StateTokenPage


const MintForm = () => {
  const [data, setData] = useState('')
  const [status, setStatus] = useState(null)

  return (
    <HStack>
      <Input
        placeholder='Data'
        value={data}
        onChange={(e) => setData(e.target.value)}
        w={300}
      />
      <MintButton
        data={data}
        onStatusChanged={(status) => setStatus(status)}
      />
      {status}
    </HStack>
  )
}

const UpdateForm = () => {
  const [data, setData] = useState('')
  const [tokenId, setTokenId] = useState(null)
  const [status, setStatus] = useState(null)

  return (
    <HStack>
      <StateSelector
        selectedValue={tokenId}
        onSelected={(tokenId) => setTokenId(tokenId)}
      />
      <Input
        placeholder='Data'
        value={data}
        onChange={(e) => setData(e.target.value)}
        w={300}
      />
      <UpdateButton
        tokenId={tokenId}
        data={data}
        onStatusChanged={(status) => setStatus(status)}
      />
      {status}
    </HStack>
  )
}

const GetState = ({ tokenId }) => {
  const { state, isLoading, isSuccess, isError, error } = useHyperboxState(tokenId)
  return (
    <HStack>
      <div>{tokenId}:</div>
      {isLoading && <div>Loading...</div>}
      {isSuccess && <div>[<span className='Code'>{state}</span>]</div>}
      {isError && <div>Error: {error}</div>}
    </HStack>
  )
}


