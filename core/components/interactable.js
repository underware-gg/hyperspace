import * as THREE from 'three'
import { getTextureImageByName } from '../textures'
import { getLocalStore, getRemoteStore } from '../singleton'
import { getTile, floors } from './map'

export const create = (type, id, x, y, data) => {
  if (id == null) return null
  const store = getRemoteStore()
  data = {
    ...data,
    position: { x, y, z: 0 },
  }
  store.setDocument(type, id, data)
  return data
}

export const exists = (type, id) => {
  if (id == null) return false
  const store = getRemoteStore()
  const data = store.getDocument(type, id)
  return data !== null
}

export const remove = (type, id) => {
  if (id == null) return
  const store = getRemoteStore()
  const data = store.getDocument(type, id)
  if (data !== null) {
    store.setDocument(type, id, null)
  }
}

export const getCollisionRect = (type, id) => {
  if (id == null) return null

  const store = getRemoteStore()
  const data = store.getDocument(type, id)
  if (data === null) return null

  return {
    position: {
      x: data.position.x * 32,
      y: data.position.y * 32,
    },
    size: {
      width: 32,
      height: 32,
    },
  }
}
