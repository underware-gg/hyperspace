import { typeDefs } from './crdt-type.js'

class KernalChanges {
  changes = {}

  constructor () {
    Object.keys(typeDefs).forEach((type) => {
      this.changes[type] = {}
    })
  }

  addOps(ops) {
    for (let i = 0; i < ops.length; i++) {
      const op = ops[i]
      const { type, key, pathIndex } = op

      this.changes[type][key] ??= {}
      this.changes[type][key][pathIndex] = true
    }
  }

  getChanges() {
    const changes = []

    const types = Object.keys(this.changes)

    for (let i = 0; i < types.length; i++) {
      const type = types[i]
      const keys = Object.keys(this.changes[type])

      for (let j = 0; j < keys.length; j++) {
        const key = keys[j]
        const pathIndices = Object.keys(this.changes[type][key])

        for (let k = 0; k < pathIndices.length; k++) {
          const pathIndex = Number(pathIndices[k])
          changes.push({ type, key, pathIndex })
        }
      }
    }

    return changes
  }

  clearChanges() {
    const types = Object.keys(this.changes)

    for (let i = 0; i < types.length; i++) {
      this.changes[types[i]] = {}
    }
  }
}

export default KernalChanges
