import { useEffect } from 'react'
import {
  useAccount,
} from 'wagmi'
import { useHyperboxStateContract } from '@/web3/hooks/useHyperboxContract'
import { useWrite } from '@/web3/hooks/useWrite'
import { Button } from '@/components/Button'


const MintButton = ({
  data = null,
  label = 'Mint',
  disabled = false,
  onStatusChanged = (status) => { },
  onIsMinting = (isMinting) => { },
  onMintResult = (success) => { },
}) => {
  const _data = typeof data == 'object' ? JSON.stringify(data) : data.toString()
  const { address } = useAccount()
  const { contractAddress, abi } = useHyperboxStateContract()
  const { write, hash, isLoading, isProcessing, isSuccess, isError, error, statusMessage } = useWrite('mint', [address, _data], { contractAddress, abi })

  useEffect(() => {
    onIsMinting(isLoading || isProcessing)
    if (!isLoading && !isProcessing) {
      onMintResult(isSuccess && !isError)
    }
  }, [isLoading, isProcessing, isSuccess, isError])

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

export default MintButton

