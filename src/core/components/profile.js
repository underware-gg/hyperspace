import RoomCollection from '@/core/interfaces/RoomCollection'

class Profile extends RoomCollection {
  constructor(room) {
    super(room, 'profile')
  }

  updateProfile(id, values) {
    let profile = this.remoteStore.getDocument('profile', id) ?? {}
    this.remoteStore.setDocument('profile', id, { ...profile, ...values })
  }
}

export default Profile
