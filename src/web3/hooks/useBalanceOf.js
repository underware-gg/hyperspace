import { useContractRead } from 'wagmi'

const useBalanceOf = (account, options = {}) => {
  const { data, isLoading, isSuccess, isError } = useContractRead({
    address: options.contractAddress,
    abi: options.abi,
    functionName: 'balanceOf',
    args: [account],
    watch: true,
  })

  return {
    balanceOf: data?.toNumber() ?? null,
    isLoading,
    isSuccess,
    isError,
  }
}

export {
  useBalanceOf,
}
