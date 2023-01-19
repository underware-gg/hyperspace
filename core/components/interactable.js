import * as THREE from 'three'
import { getTextureImageByName } from '../textures'
import { getLocalStore, getRemoteStore } from '../singleton'
import { getTile, floors } from './map'

export const create = (type, id, x, y, data) => {
  const store = getRemoteStore()
  data = {
    ...data,
    position: {
      x,
      y,
    },
  }
  store.setDocument(type, id, data)
  return data
}

export const exists = (type, id) => {
  const store = getRemoteStore()
  const data = store.getDocument(type, id)

  return data !== null
}

export const getCollisionRect = (type, id) => {
  const store = getRemoteStore()
  const data = store.getDocument(type, id)

  if (data === null) {
    return null
  }

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
