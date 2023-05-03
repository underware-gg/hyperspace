import { useContractRead } from 'wagmi'
import { validateArgs } from '@/web3/utils'

// IERC721Enumerable access
// https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#IERC721Enumerable

const useBalanceOf = (owner, options = {}) => {
  const args = [owner]
  const { data, isLoading, isSuccess, isError } = useContractRead({
    address: options.contractAddress,
    abi: options.abi,
    functionName: 'balanceOf',
    args,
    watch: true,
    enabled: validateArgs(args),
  })

  return {
    balanceOf: data?.toNumber() ?? null,
    isLoading,
    isSuccess,
    isError,
  }
}

const useTokenOfOwnerByIndex = (owner, index, options = {}) => {
  const args = [owner, index]
  const { data, isLoading, isSuccess, isError } = useContractRead({
    address: options.contractAddress,
    abi: options.abi,
    functionName: 'tokenOfOwnerByIndex',
    args,
    watch: true,
    enabled: validateArgs(args),
  })

  return {
    tokenId: data?.toNumber() ?? null,
    isLoading,
    isSuccess,
    isError,
  }
}

export {
  useBalanceOf,
  useTokenOfOwnerByIndex,
}
