
export const isCrdtData = (data) => {
  if (!Array.isArray(data) || data.length == 0) {
    return false
  }
  for(let i = 0 ; i < data.length ; ++i) {
    const item = data[i]
    if (!item.key || !item.type || !item.version) {
      console.log(`NOT CRDT`, item)
      return false
    }
  }
  console.log(`IS CRDT`)
  return true
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

