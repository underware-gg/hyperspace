import RoomCollection from '@/core/interfaces/RoomCollection'

class Profile extends RoomCollection {
  constructor(room) {
    super(room, 'profile')

    this.actions.addActionDownListener('toggle3d', () => {
      const profile = this.agentStore.getDocument('profile', this.agentId)

      let view3d = this.canvas3d != null && (profile ? !profile.view3d : true)
      
      this.updateProfile(this.agentId, {
        view3d
      })
    })
  }

  updateProfile(id, values) {
    let profile = this.agentStore.getDocument('profile', id) ?? {}
    this.agentStore.setDocument('profile', id, { ...profile, ...values })
  }
}

export default Profile
