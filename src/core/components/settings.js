import { getRemoteStore } from '@/core/singleton'

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

export const create = (id) => {
  const store = getRemoteStore()
  store.setDocument('settings', id, defaultSettings)
  return defaultSettings
}

export const update = (id, newSettings) => {
  const store = getRemoteStore()
  let settings = store.getDocument('settings', id) ?? defaultSettings
  store.setDocument('settings', id, { ...settings, ...newSettings })
}

export const remove = (id) => {
  const store = getRemoteStore()
  store.setDocument('settings', id, null)
}

export const exists = (id) => {
  const store = getRemoteStore()
  const settings = store.getDocument('settings', id)
  return settings !== null
}
