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

const eraseData = (store) => {
  for (const type of ['portal', 'screen', 'tileset', 'document', 'trigger', 'permission', 'player', 'editor', 'profile']) {
    const ids = store.getIds(type) ?? []
    for (const id of ids) {
      store.setDocument(type, id, null)
    }
  }
}

export const importCrdtData = (data, store, replaceData = false) => {
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
        store.setDocument(type, id, value)
      }
    }
  }
  return true
}
