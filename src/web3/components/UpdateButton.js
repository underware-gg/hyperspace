import React, { useEffect } from 'react'
import { useHyperboxStateContract } from '@/web3/hooks/useHyperboxContract'
import { useWrite } from '@/web3/hooks/useWrite'
import { Button } from '@/components/Button'


const UpdateButton = ({
  tokenId = null,
  data = null,
  label = 'Update',
  disabled = false,
  onStatusChanged = (status) => { },
  // onIsMinting = (isMinting) => { },
  // onMintResult = (success) => { },
}) => {
  const _data = typeof data == 'object' ? JSON.stringify(data) : data.toString()
  const { contractAddress, abi } = useHyperboxStateContract()
  const { write, isLoading, isProcessing, isSuccess, isError, error, statusMessage } = useWrite('setState', [tokenId, _data], { contractAddress, abi })

  useEffect(() => {
    onStatusChanged(statusMessage)
  }, [statusMessage])

  const _canMint = !disabled && write && !isLoading && !isProcessing

  return (
    <Button disabled={!_canMint} onClick={() => write?.()}>
      {label}
    </Button>
  )
}

export default UpdateButton
