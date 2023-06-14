import { typeDefs } from '@/core/merge/crdt-type'

export const isCrdtData = (data) => {
  if (!Array.isArray(data) || data.length == 0) {
    return false
  }
  for (let i = 0; i < data.length; ++i) {
    const item = data[i]
    if (!item.key || !item.type || !item.version) {
      return false
    }
  }
  return true
}

export const exportCrdtData = (clientRoom) => {
  return clientRoom?.getSnapshotOps() ?? null
}

export const importCrdtData = (data, store, replaceData) => {
  if (!isCrdtData(data) || !store?.setDocument) {
    console.warn(`importCrdtData() bad data or store`, data, store)
    return false
  }
  if (replaceData) {
    eraseData(store)
  }
  for (const op of data) {
    if (op.pathIndex === 0) {
      const { type, key, value } = op
      store.setDocument(type, key, value)
    }
  }
  return true
}

export const exportDataTypes = (types, store) => {
  let result = {}
  for (const type of types) {
    result[type] = {}
    const ids = store.getIds(type) ?? []
    for (const id of ids) {
      result[type][id] = store.getDocument(type, id) ?? null
    }
  }
  return result
}

export const importDataTypes = (data, store, replaceData = false) => {
  if (!data || typeof data != 'object' || !store?.setDocument) {
    console.warn(`importDataTypes() bad data or store`, data, store)
    return false
  }
  if (replaceData) {
    eraseData(store)
  }
  for (const type of Object.keys(data)) {
    if (typeDefs[type]) {
      for (const id of Object.keys(data[type])) {
        const value = data[type][id]
        if (!replaceData) {
          eraseTile(store, type, value)
        }
        store.setDocument(type, id, value)
      }
    }
  }
  return true
}

const eraseData = (store) => {
  for (const type of ['portal', 'screen', 'tileset', 'document', 'trigger', 'permission', 'player', 'editor', 'profile', 'book']) {
    const ids = store.getIds(type) ?? []
    for (const id of ids) {
      store.setDocument(type, id, null)
    }
  }
}

const eraseTile = (store, type, value) => {
  // check types that can be placed at tile
  const types = ['portal', 'screen', 'trigger', 'book']
  if (!types.includes(type)) return

  // check if value has tile position
  const { position: { x, y } } = value
  if (typeof x !== 'number' || typeof y !== 'number') return

  // erase all tiles at this position
  for (const t of types) {
    const ids = store.getIds(t) ?? []
    for (const id of ids) {
      const v = store.getDocument(t, id)
      const { position: { x: xx, y: yy } } = v
      if (xx === x && yy === y) {
        store.setDocument(t, id, null)
      }
    }
  }
}

