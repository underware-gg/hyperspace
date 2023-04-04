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

    this.patched = false

    this.clientRoom.on('patched', (patched) => {
      if (this.patched) return

      console.log(`[${this.slug}] PATCHED SETTINGS:`, patched, this.Settings.get('world'))

      if (!this.exists('world')) {
        this.resetSettings('world')
      }

      this.patched = true
    })
  }

  resetSettings(id) {
    this.upsert(id, defaultSettings)
  }

  updateSettings(id, newSettings) {
    let settings = this.remoteStore.getDocument('settings', id) ?? defaultSettings
    this.remoteStore.setDocument('settings', id, {
      ...settings,
      ...newSettings,
    })
  }

}

export default Settings
