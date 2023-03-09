import RoomMate from '@/core/interfaces/RoomMate'

export const defaultSettings = {
  size: {
    width: 20,
    height: 15,
  },
  entry: {
    x: 9,
    y: 3,
  },
}

class Settings extends RoomMate {
  constructor(room) {
    super(room)
  }

  create(id) {
    this.remoteStore.setDocument('settings', id, defaultSettings)
    return defaultSettings
  }

  update(id, newSettings) {
    let settings = this.remoteStore.getDocument('settings', id) ?? defaultSettings
    this.remoteStore.setDocument('settings', id, { ...settings, ...newSettings })
  }

  remove(id) {
    this.remoteStore.setDocument('settings', id, null)
  }

  exists(id) {
    const settings = this.remoteStore.getDocument('settings', id)
    return settings !== null
  }

}

export default Settings
