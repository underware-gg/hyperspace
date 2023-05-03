import RoomCollection from '@/core/interfaces/RoomCollection'

//
// modus operandi
// ==============
//
// > new user / new session
// a random agentId is created with nanoid()
// agentId is stored on the browser local storage
// a new profile is NOT created automatically
// useProfile() and Player.getPlayerTextureName() will choose a deterministic character/spritesheet based on the agentId hashed number
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
// currently: Ethereum, Verida
//
// > unlink Wallet from profile
// not implemented, but there could be a button 'Sign out and unlink'
// 

class Profile extends RoomCollection {
  constructor(room) {
    super(room, 'profile')

    this.actions.addActionDownListener('toggle3d', () => {
      const profile = this.agentStore.getDocument('profile', this.agentId)

      let view3d = this.canvas3d != null && (profile ? !profile.view3d : true)
      
      this.updateProfile(this.agentId, {
        view3d
      })

      this.localStore.setDocument('editGravityMap', 'world', false)
    })
  }

  updateProfile(id, values) {
    let profile = this.agentStore.getDocument('profile', id) ?? {}
    this.agentStore.setDocument('profile', id, { ...profile, ...values })
  }
}

export default Profile
