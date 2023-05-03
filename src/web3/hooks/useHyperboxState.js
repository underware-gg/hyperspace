import { useContractRead } from 'wagmi'
import { useHyperboxStateContract } from '@/web3/hooks/useHyperboxContract'
import { validateArgs } from '@/web3/utils'

const useHyperboxState = (tokenId) => {
  const args = [tokenId]
  const { contractAddress, abi } = useHyperboxStateContract()
  const { data, isLoading, isSuccess, isError } = useContractRead({
    address: contractAddress,
    abi,
    functionName: 'getState',
    args,
    watch: true,
    enabled: validateArgs(args),
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
