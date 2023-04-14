import { useContractRead } from 'wagmi'
import { useHyperboxStateContract } from '@/web3/hooks/useHyperboxContract'

const useHyperboxState = (tokenId) => {
  const { contractAddress, abi } = useHyperboxStateContract()
  const { data, isLoading, isSuccess, isError } = useContractRead({
    address: contractAddress,
    abi,
    functionName: 'getState',
    args: [tokenId],
    watch: true,
  })

  return {
    state: data ?? null,
    isLoading,
    isSuccess,
    isError,
  }
}

export {
  useHyperboxState,
}
