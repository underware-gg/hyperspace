import RoomCollection from '@/core/interfaces/RoomCollection'

// supported wallet types, by priority
export const WALLET = {
  Verida: 'Verida',
  Ethereum: 'Ethereum',
}

class Wallet extends RoomCollection {
  constructor(room) {
    super(room, 'wallet')

    // clear profile for remote gents
    this.agentStore.setDocument('wallet', this.agentId, null)
  }

  connectedWallet(walletType, address) {
    // link wallet to profile
    if (address) {
      const wallet = this.agentStore.getDocument('wallet', address)

      if (!wallet?.profileId) {
        // inherits current profileId or agentId
        const profileId = this.Profile.getAgentProfileId(this.agentId)

        this.agentStore.setDocument('wallet', address, {
          walletType,
          profileId,
        })

        // this profile is not signed
        this.Profile.updateProfile(profileId, {
          signed: true,
        })
      }
    }

    console.log(`connectedWallet:`, walletType, address)
    this.localStore.setDocument('connectedWallets', walletType, address)
  }

}

export default Wallet
