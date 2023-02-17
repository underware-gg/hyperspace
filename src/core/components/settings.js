import { getRemoteStore } from '@/core/singleton'

export const defaultMapSize = {
  width: 20,
  height: 15,
}

export const defaultEntryTile = {
  x: 9,
  y: 3,
}

export const create = (id, name) => {
  const store = getRemoteStore()
  const settings = {
    size: defaultMapSize,
    entry: defaultEntryTile,
  }
  store.setDocument('settings', id, settings)
  return settings
}

export const update = (id, newSettings) => {
  const store = getRemoteStore()
  let settings = store.getDocument('settings', id) ?? {}
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
