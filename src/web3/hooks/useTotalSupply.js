import { useContractRead } from 'wagmi'

const useTotalSupply = (options = {}) => {
  const { data, isError, isLoading } = useContractRead({
    address: options.contractAddress,
    abi: options.abi,
    functionName: 'totalSupply',
  })

  return {
    totalSupply: data?.toNumber() ?? null,
    isError,
    isLoading,
  }
}

export {
  useTotalSupply,
}
