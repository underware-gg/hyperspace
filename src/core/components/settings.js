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

    this.clientRoom.on('patched', (patched) => {
      if (!patched && !this.exists('world')) {
        this.resetSettings('world')
      }
    })
  }

  resetSettings(id) {
    this.upsert(id, defaultSettings)
  }

  updateSettings(id, newSettings) {
    let settings = this.remoteStore.getDocument('settings', id) ?? defaultSettings
    this.remoteStore.setDocument('settings', id, { ...settings, ...newSettings })
  }

}

export default Settings
