import { useMemo } from 'react'
import { useNetwork } from 'wagmi'

const HyperboxStateToken = require('@/web3/contracts/HyperboxStateToken.json')

const useHyperboxContract = (artifacts) => {
  const { chain } = useNetwork()

  const abi = useMemo(() => ((artifacts && chain?.id) ? artifacts.abi : null), [artifacts, chain?.id])
  const contractName = useMemo(() => (artifacts?.contractName ?? null), [artifacts, chain?.id])
  const contractAddress = useMemo(() => (artifacts?.networks?.[chain?.id]?.address ?? null), [artifacts, chain?.id])

  return {
    contractAddress,
    contractName,
    abi,
  }
}

const useHyperboxStateContract = () => {
  return useHyperboxContract(HyperboxStateToken)
}

export {
  useHyperboxStateContract,
}
