import { useState, useEffect } from 'react'
import { useEnsName as wagmiEnsName } from 'wagmi'
import { validateAddress, formatAddress } from '@/web3/address'

const useEnsName = (address) => {
	return wagmiEnsName({
		address,
		enabled: true,
	})
}

const useAddress = (address) => {
	const [addressShort, setAddressShort] = useState('0x?')
	const [linkEtherscan, setLinkEtherscan] = useState(null)
	const [linkOpenSea, setLinkOpenSea] = useState(null)
	const { data: ens } = useEnsName(address)

	useEffect(() => {
		if (validateAddress(address)) {
			setAddressShort(formatAddress(address, true))
			// setLinkEtherscan(EC.makeEtherscanLink(address))
			// setLinkOpenSea(EC.makeOpenSeaAddressLink(address))
		}
	}, [address])

	return {
		address,
		addressShort,
		addressENS: ens ?? null,
		addressDisplay: ens ?? addressShort,
		linkEtherscan,
		linkOpenSea,
	}
}

export {
	useEnsName,
	useAddress,
}