import RoomCollection from '@/core/interfaces/RoomCollection'

class Permission extends RoomCollection {
  constructor(room) {
    super(room, 'profile')
  }

  create(id, name, spritesheet) {
    const profile = { name, spritesheet }
    this.remoteStore.setDocument('profile', id, profile)
    return profile
  }

  update(id, values) {
    let profile = this.remoteStore.getDocument('profile', id) ?? {}
    this.remoteStore.setDocument('profile', id, { ...profile, ...values })
  }

  remove(id) {
    this.remoteStore.setDocument('profile', id, null)
  }

  exists(id) {
    const profile = this.remoteStore.getDocument('profile', id)
    return profile !== null
  }
}

export default Permission
