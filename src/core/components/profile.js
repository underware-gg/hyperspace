import RoomCollection from '@/core/interfaces/RoomCollection'
import { WALLET } from '@/core/components/wallet'

//
// modus operandi
// ==============
//
// > new user / new session
// a random agentId is created with nanoid()
// agentId is stored on the browser local storage
// a new profile is NOT created automatically
// useProfile() and Player.getDefaultPlayerTextureName() will choose a deterministic character/spritesheet based on the agentId hashed number
//
// > user edits the name or select a new spritesheet
// a profile will be created with the user's custom info
// agentId is used as the key to this profile
//
// > returning user (same browser, same session storage)
// agentId is retrived from the browser local storage
// if no profile for this agent, use the 'default' character based on the agentId hash
// if a profile was created, use it
// we have a persistent profile per session, without signing
// if browser storage is cleared, the profile is lost
//
// > user signs in (Verida or Ethereum wallet) for the first time
// we call Wallet.connectedWallet()
// the agentId is automatically 'upgraded' to profileId
// no need to change the stored profile, its key remains the same
// a wallet type record is created (wallet.js), linking the connected address and profileId
// profile is flagged as 'signed', and can now only be loaded by a linked wallet
// a user can have many wallet records (Verida, Ethereum, ...) linked to the same profile
// the current agentId is now disposable
// 
// > returning signed user, new browser session
// new session, new agentId, with default hash profile
// user signs in (Verida or Ethereum) to restore their Profile
// we find the connected address record linking to the original profileId
// stored profile is loaded, user is back!
//
// > multiple Profiles
// new session, new agentId, user signs in with Verida, profileId is created, linked to Verida address
// new session, new agentId, user signs in with Ethereum, another profileId is created, linked to Ethereum address
// if user signs in with both, we need to set precedency
// currently: Verida, Ethereum
//
// > unlink Wallet from profile
// not implemented, but there could be a button 'Sign out and unlink'
// 

class Profile extends RoomCollection {
  constructor(room) {
    super(room, 'profile')

    this.actions.addActionDownListener('toggle3d', () => {
      const profile = this.getCurrentProfile()

      let view3d = (profile ? !profile.view3d : true) && this.canvas3d != null

      this.updateCurrentProfile({
        view3d
      })

      this.localStore.setDocument('editGravityMap', 'world', false)
    })

    this.localStore.on({ type: 'connectedWallets', event: 'change' }, (walletType, address) => {
      let wallet = null

      // independent of connected wallet, choose profile according to WALLET priority
      for (const type of Object.values(WALLET)) {
        // wallet is connected...?
        const _address = this.localStore.getDocument('connectedWallets', type)
        if (_address) {
          // wallet has a profileId...?
          wallet = this.agentStore.getDocument('wallet', _address)
          if (wallet) break
        }
      }

      console.log(`switch wallet profile:`, wallet?.walletType, wallet?.profileId)
      this.localStore.setDocument('profileId', this.agentId, wallet?.profileId ?? null)

      // notify remote clients of my profileId
      this.agentStore.setDocument('wallet', this.agentId, {
        walletType: 'Agent',
        profileId: wallet?.profileId ?? null,
      })

    })
  }

  getCurrentProfileId() {
    return this.localStore.getDocument('profileId', this.agentId) ?? this.agentId
  }

  getAgentProfileId(agentId) {
    if (agentId == this.agentId) {
      return this.getCurrentProfileId()
    }
    // check if remote agent is using a custom profile
    const wallet = this.agentStore.getDocument('wallet', agentId)
    return wallet?.profileId ?? agentId
  }

  getCurrentProfile() {
    const profileId = this.getCurrentProfileId()
    return this.agentStore.getDocument('profile', profileId) ?? {}
  }

  getAgentProfile(agentId) {
    const profileId = this.getAgentProfileId(agentId)
    return this.agentStore.getDocument('profile', profileId) ?? {}
  }

  updateCurrentProfile(values) {
    const profileId = this.getCurrentProfileId()
    this.updateProfile(profileId, values)
  }

  updateProfile(id, values) {
    let profile = this.agentStore.getDocument('profile', id) ?? {}
    this.agentStore.setDocument('profile', id, { ...profile, ...values })
  }
}

export default Profile
