import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi'

const useWrite = (functionName, args = [], options) => {
  const { config } = usePrepareContractWrite({
    address: options.contractAddress,
    abi: options.abi,
    functionName,
    args,
  })
  const { write, data, isLoading, isSuccess, isError, error } = useContractWrite(config)
  const hash = isSuccess ? data?.hash : null
  const {
    isLoading: isLoadingTrans,
    isSuccess: isSuccessTrans,
    isError: isErrorTrans,
    error: errorTrans
  } = useWaitForTransaction({ hash })

  return {
    write,
    isLoading: isLoading ?? null, // waiting for wallet approval
    isProcessing: isLoadingTrans ?? false,
    hash,
    isSuccess: isSuccessTrans ?? false,
    isError: isError ?? isErrorTrans ?? false,
    error: error ?? errorTrans ?? false,
  }
}

export {
  useWrite,
}
