import RoomCollection from '@/core/interfaces/RoomCollection'

// supported wallet types, by priority
export const WALLET = {
  Ethereum: 'Ethereum',
  Verida: 'Verida',
}

class Wallet extends RoomCollection {
  constructor(room) {
    super(room, 'wallet')

    this.localStore.on({ type: 'connectedWallets', event: 'change' }, (walletType, address) => {
    })
  }

  connectedWallet(walletType, address) {
    console.log(`connectedWallet:`, walletType, address)
    this.localStore.setDocument('connectedWallets', walletType, address)

    this.linkWalletToProfile(walletType, address)
  }

  linkWalletToProfile(walletType, address) {
    let profileId = null

    if (address) {
      // connected: link wallet to profile
      const wallet = this.agentStore.getDocument('wallet', address)

      if (wallet?.profileId) {
        // restore profile
        profileId = wallet.profileId
      } else {
        // link wallet to profile
        // agentId becomes the profileId
        profileId = this.agentId

        this.agentStore.setDocument('wallet', address, {
          walletType,
          profileId,
        })

        // this profile is not signed
        this.Profile.updateProfile(profileId, {
          signed: true,
        })

      }
    } else {
      // disconnected: use other connected wallets?
      // TODO: TEST THIS when Verida is working again
      for (const type of Object.values(WALLET)) {
        const addr = this.localStore.getDocument('connectedWallets', type)
        if (addr) {
          linkWalletToProfile(type, addr)
          return
        }
      }
    }

    console.log(`use wallet profile:`, walletType, profileId)
    this.localStore.setDocument('profileId', this.agentId, profileId)
  }

}

export default Wallet
