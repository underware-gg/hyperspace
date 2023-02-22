import { getRemoteStore } from '@/core/singleton'

export const create = (id, name, spritesheet) => {
  const store = getRemoteStore()
  const profile = { name, spritesheet }
  store.setDocument('profile', id, profile)
  return profile
}

export const update = (id, values) => {
  const store = getRemoteStore()
  let profile = store.getDocument('profile', id) ?? {}
  store.setDocument('profile', id, { ...profile, ...values })
}

export const remove = (id) => {
  const store = getRemoteStore()
  store.setDocument('profile', id, null)
}

export const exists = (id) => {
  const store = getRemoteStore()
  const profile = store.getDocument('profile', id)
  return profile !== null
}
