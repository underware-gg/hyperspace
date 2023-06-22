import React, { useMemo } from 'react'
import { useNetwork } from 'wagmi'

const HyperboxStateToken = require('@/web3/artifacts/HyperboxStateToken.json')

const useHyperboxContract = (artifacts) => {
  const { chain } = useNetwork()

  const contractName = useMemo(() => (artifacts?.contractName ?? null), [artifacts, chain?.id])
  const contractAddress = useMemo(() => (artifacts?.networks?.[chain?.id]?.address ?? null), [artifacts, chain?.id])
  const transactionHash = useMemo(() => (artifacts?.networks?.[chain?.id]?.transactionHash ?? null), [artifacts, chain?.id])
  const abi = useMemo(() => ((artifacts && chain?.id) ? artifacts.abi : null), [artifacts, chain?.id])

  return {
    contractName,
    contractAddress,
    transactionHash,
    abi,
  }
}

const useHyperboxStateContract = () => {
  return useHyperboxContract(HyperboxStateToken)
}

export {
  useHyperboxStateContract,
}
