import { useState, useEffect } from 'react'
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi'
import { validateArgs } from '@/web3/utils'

const useWrite = (functionName, args = [], options) => {
  const { config } = usePrepareContractWrite({
    address: options.contractAddress,
    abi: options.abi,
    functionName,
    args,
    enabled: (functionName && validateArgs(args)),
  })

  const { write, data, isLoading, isSuccess, isError, error } = useContractWrite(config)
  const hash = isSuccess ? data?.hash : null
  const {
    isLoading: isProcessing,
    isSuccess: isSuccessTrans,
    isError: isErrorTrans,
    error: errorTrans
  } = useWaitForTransaction({ hash })

  const [statusMessage, setStatusMessage] = useState('')
  useEffect(() => {
    setStatusMessage(
      isLoading ? <div>Approve Wallet...</div>
        : isProcessing ? <div>Processing...</div>
          : isSuccess ? <div>Success!</div>
            : isError ? <div> Error!</div>
              : ''
    )
    if (isProcessing) console.log(`${functionName}() is processing...`, hash)
    if (isError) console.log(`${functionName}() ERROR:`, error)
  }, [isLoading, isProcessing, isSuccess, isError])

  return {
    write,
    isLoading: isLoading ?? null, // waiting for wallet approval
    isProcessing: isProcessing ?? false,
    hash,
    isSuccess: isSuccessTrans ?? false,
    isError: isError ?? isErrorTrans ?? false,
    error: error ?? errorTrans ?? false,
    statusMessage,
  }
}

export {
  useWrite,
}
