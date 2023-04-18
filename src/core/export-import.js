
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

export const importCrdtData = (data, store) => {
  if (!isCrdtData(data)) return false
  for (const op of data) {
    if (op.pathIndex === 0) {
      const { type, key, value } = op
      store.setDocument(type, key, value)
    }
  }
  return true
}

export const exportTypes = (types, store) => {
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
