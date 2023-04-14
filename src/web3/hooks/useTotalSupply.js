import { useContractRead } from 'wagmi'

const useTotalSupply = (options = {}) => {
  const { data, isLoading, isSuccess, isError } = useContractRead({
    address: options.contractAddress,
    abi: options.abi,
    functionName: 'totalSupply',
    watch: true,
  })

  return {
    totalSupply: data?.toNumber() ?? null,
    isLoading,
    isSuccess,
    isError,
  }
}

export {
  useTotalSupply,
}
