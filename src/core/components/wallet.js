import RoomCollection from '@/core/interfaces/RoomCollection'

// supported wallet types, by priority
export const WALLET = {
  Ethereum: 'Ethereum',
  Verida: 'Verida',
}

class Wallet extends RoomCollection {
  constructor(room) {
    super(room, 'wallet')

    // clear profile for remote gents
    this.agentStore.setDocument('wallet', this.agentId, null)

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
        // inherits current profileId or agentId
        profileId = this.Profile.getCurrentProfileId()

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
          this.linkWalletToProfile(type, addr)
          return
        }
      }
    }

    console.log(`use wallet profile:`, walletType, profileId)
    this.localStore.setDocument('profileId', this.agentId, profileId)

    // notify remote clients of my profileId
    this.agentStore.setDocument('wallet', this.agentId, {
      walletType: 'Agent',
      profileId,
    })
  }

}

export default Wallet
