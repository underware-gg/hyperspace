import React from 'react'
// import { useAccount } from 'wagmi'
import { useAddress } from '@/hooks/useAddress'
// import { CopyIcon } from '@/components/Icons'

function Address({
	address,
}) {
	// const { address } = useAccount()
	const { addressShort, addressENS } = useAddress(address)

	if (!address) return null

	return (
		<div>
      {/* {addressShort} <CopyIcon content={address} /> */}
			{addressShort}
			{/* {addressENS && <p>{addressENS}</p>} */}
		</div>
	)
}

export {
	Address,
}

