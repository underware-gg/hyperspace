import { getRemoteStore, getLocalStore } from '@/core/singleton'
import * as Interactable from '@/core/components/interactable'

export const exists = (id) => {
  return Interactable.exists('permission', id)
}

export const remove = (id) => {
  return Interactable.remove('permission', id)
}

export const canView = (id, didAddress) => {
  const store = getRemoteStore()
  const permission = store.getDocument('permission', id)
  if (!permission) {
    return true
  }
  if (didAddress === undefined) {
    didAddress = getLocalStore().getDocument('user', 'VeridaUser')?.getDidAddress() ?? null
  }
  return (permission.visible || permission.owner == didAddress)
}

export const canEdit = (id, didAddress) => {
  const store = getRemoteStore()
  const permission = store.getDocument('permission', id)
  if (!permission) {
    return true
  }
  if (didAddress === undefined) {
    didAddress = getLocalStore().getDocument('user', 'VeridaUser')?.getDidAddress() ?? null
  }
  return ((permission.visible && permission.public) || permission.owner == didAddress)
}

export const updatePermission = (id, owner, values) => {
  const store = getRemoteStore()
  let permission = store.getDocument('permission', id)
  
  if (!permission) {
    permission = {
      id,
      owner,
      visible: true,
      public: true,
    }
  } else if (permission.owner != owner) {
    console.warn(`Not owner!`, id)
    return
  }

  permission = {
    ...permission,
    ...values,
  }

  store.setDocument('permission', id, permission)
}

