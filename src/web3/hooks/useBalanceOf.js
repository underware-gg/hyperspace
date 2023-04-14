import { useContractRead } from 'wagmi'

const useBalanceOf = (account, options = {}) => {
  const { data, isError, isLoading } = useContractRead({
    address: options.contractAddress,
    abi: options.abi,
    functionName: 'balanceOf',
    args: [account],
  })

  return {
    balanceOf: data?.toNumber() ?? null,
    isError,
    isLoading,
  }
}

export {
  useBalanceOf,
}
