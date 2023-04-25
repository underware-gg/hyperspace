import { useEffect, useMemo, useState } from 'react'
import { Select, useMenu } from '@chakra-ui/react'
import { useAccount } from 'wagmi'
import { useHyperboxStateContract } from '@/web3/hooks/useHyperboxContract'
import { useBalanceOf, useTokenOfOwnerByIndex } from '@/web3/hooks/useBalance'


const StateOption = ({
  owner = null,
  index = null,
}) => {

  const { contractAddress, abi } = useHyperboxStateContract()
  const { tokenId } = useTokenOfOwnerByIndex(owner, index, { contractAddress, abi })

  return (
    <option value={tokenId}>{tokenId}</option>
  )
}

const StateSelector = ({
  disabled = false,
  selectedValue = null,
  onSelected = (tokenId) => { },
}) => {
  const { address } = useAccount()

  const { contractAddress, abi } = useHyperboxStateContract()
  const { balanceOf } = useBalanceOf(address, { contractAddress, abi })

  const options = useMemo(() => {
    let result = []
    for (let i = 0; i < balanceOf ; ++i) {
      result.push(<StateOption key={`token_${i}`} owner={address} index={i} />)
    }
    return result
  }, [address])

  const _onChange = (value) => {
    const _tokenId = !isNaN(parseInt(value)) ? parseInt(value) : null
    onSelected(_tokenId)
  }

  return (
    <Select
      w='65px'
      size='sm'
      value={selectedValue ?? ''}
      placeholder={null}
      disabled={disabled}
      onChange={(e) => _onChange(e.target.value)}
    >
      <option value={null}>Id</option>
      {options}
    </Select>
  )
}

export default StateSelector
