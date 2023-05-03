const { ethers } = require('ethers')

export const zeroAddress = ethers.constants.AddressZero

export function isZeroAddress(address) {
	return (address == ethers.constants.AddressZero || (address?.length > 2 && ethers.constants.AddressZero.startsWith(address)))
}

export function validateAddress(address, zeroIsValid = false) {
	if (isZeroAddress(address)) {
		return zeroIsValid
	}
	return ethers.utils.isAddress(address)
}

export function formatAddress(address, short = false) {
	if (!validateAddress(address)) return '0x?'
	let result = address.toUpperCase()
	result = '0x' + (result[1] == 'X' ? result.substring(2) : result)
	if (short)
		result = result.substring(0, 6) + '…' + result.substring(result.length - 4)
	return result
}

export function validateArgs(args=[]) {
  const hasNullArgs = args.reduce((result, value) => result || value == null, false)
  return !hasNullArgs
}

