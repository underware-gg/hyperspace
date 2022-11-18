import { typeDefs } from './crdt-type.js'
import {
  applyOp,
  createOp,
  getValueAtPath,
  deepCopy,
  getParentPathIndex,
} from './tiny-merge.js'

class Kernal {
  collections = {}
  versions = {}
  latestSeq = -1

  constructor (onOps) {
    this.onOps = onOps

    Object.keys(typeDefs).forEach((type) => {
      this.versions[type] = {}
      this.collections[type] = {}
    })
  }

  getIds(type) {
    return Object.keys(this.collections[type] ?? {}) ?? []
  }

  get(type, id) {
    return this.collections[type]?.[id]
  }

  getVersion(type, id, pathIndex) {
    return this.versions[type][id][pathIndex]
  }

  applyOps(ops, source) {
    const filteredOps = []

    for (let op of ops) {
      const { type, version } = op

      this.latestSeq = Math.max(version[0], this.latestSeq)

      if (this.versions[type] === undefined) {
        continue
      }

      if (applyOp(op, this.versions[type], this.collections[type])) {
        filteredOps.push(op)
      }
    }

    if (filteredOps.length > 0) {
      this.onOps(filteredOps, source)
    }
  }

  getOpsFromChanges(changes) {
    const ops = []

    for (let i = 0; i < changes.length; i++) {
      const { type, key, pathIndex } = changes[i]

      if (this.versions[type][key] === undefined) {
        continue
      }

      if (this.versions[type][key][pathIndex] === undefined) {
        continue
      }

      const path = typeDefs[type].paths[pathIndex]
      const value = getValueAtPath(this.collections[type][key], path)

      if (pathIndex === 0) {
        ops.push({
          type,
          key,
          version: this.getVersion(type, key, pathIndex),
          pathIndex,
          value,
        })

        continue
      }

      const parentPathIndex = getParentPathIndex(typeDefs[type], this.versions[type][key], pathIndex)
      if (parentPathIndex === -1) {
        continue
      }

      const parentVersion = this.versions[type][key][parentPathIndex]

      ops.push({
        type,
        key,
        version: this.getVersion(type, key, pathIndex),
        pathIndex,
        parentPathIndex,
        parentVersion,
        value,
      })
    }

    return ops
  }

  getSnapshotOps() {
    const ops = []

    const collections = Object.entries(this.collections)

    for (let i = 0; i < collections.length; i++) {
      const [type, collection] = collections[i]
      const keys = Object.keys(collection)
      const typeDef = typeDefs[type]

      for (let j = 0; j < keys.length; j++) {
        const key = keys[j]
        const document = collection[key]

        for (let fieldIndex in this.versions[type][key]) {
          const path = typeDef.paths[fieldIndex]
          const pathString = `/${path.join('.')}`
          const value = deepCopy(getValueAtPath(document, path))

          ops.push(
            createOp(
              this.versions[type],
              type,
              key,
              pathString,
              this.versions[type][key][fieldIndex],
              value,
            )
          )
        }
      }
    }

    return ops
  }
}

export default Kernal
