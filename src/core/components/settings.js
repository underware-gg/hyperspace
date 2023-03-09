import RoomCollection from '@/core/interfaces/RoomCollection'

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

class Settings extends RoomCollection {
  constructor(room) {
    super(room, 'settings')
  }

  initializeSettings(id) {
    if (!this.exists(id)) {
      return this.create(id, defaultSettings)
    }
  }

  update(id, newSettings) {
    let settings = this.remoteStore.getDocument('settings', id) ?? defaultSettings
    this.remoteStore.setDocument('settings', id, { ...settings, ...newSettings })
  }

}

export default Settings
