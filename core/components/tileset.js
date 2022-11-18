import { getRemoteStore } from 'core/singleton'

export const create = (id, tileset) => {
  const store = getRemoteStore()

  store.setDocument('tileset', id, tileset)

  return tileset
}

export const remove = (id) => {
  const store = getRemoteStore()
  store.setDocument('tileset', id, null)
}

export const exists = (id) => {
  const store = getRemoteStore()
  const tileset = store.getDocument('tileset', id)

  return tileset !== null
}
