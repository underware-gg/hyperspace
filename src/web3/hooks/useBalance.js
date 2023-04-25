import { useContractRead } from 'wagmi'

// IERC721Enumerable access
// https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#IERC721Enumerable

const useBalanceOf = (owner, options = {}) => {
  const { data, isLoading, isSuccess, isError } = useContractRead({
    address: options.contractAddress,
    abi: options.abi,
    functionName: 'balanceOf',
    args: [owner],
    watch: true,
  })

  return {
    balanceOf: data?.toNumber() ?? null,
    isLoading,
    isSuccess,
    isError,
  }
}

const useTokenOfOwnerByIndex = (owner, index, options = {}) => {
  const { data, isLoading, isSuccess, isError } = useContractRead({
    address: options.contractAddress,
    abi: options.abi,
    functionName: 'tokenOfOwnerByIndex',
    args: [owner, index],
    watch: true,
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
