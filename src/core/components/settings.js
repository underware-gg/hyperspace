import RoomCollection from '@/core/interfaces/RoomCollection'
import { DEFAULT_MAP_WIDTH, DEFAULT_MAP_HEIGHT } from './map'

export const defaultSettings = {
  size: {
    width: DEFAULT_MAP_WIDTH,
    height: DEFAULT_MAP_HEIGHT,
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
