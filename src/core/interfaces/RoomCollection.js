import RoomMate from '@/core/interfaces/RoomMate'

// crdt collections created inside Room
// share the Room client and stores (RoomMate)
// can access to other objects (RoomMate)
// common functions to access the collection data

class RoomCollection extends RoomMate {
  constructor(room, type) {
    super(room)
    this.type = type
  }

  exists(id) {
    if (id == null) return false
    const data = this.remoteStore.getDocument(this.type, id)
    return data !== null
  }

  remove(id, checkPermission = false) {
    if (id == null) return
    const data = this.remoteStore.getDocument(this.type, id)
    if (data == null) return
    if (checkPermission && !this.Permission.canEdit(id)) {
      console.warn(`No permission to delete [${this.type}] (${id})`)
      return
    }
    this.remoteStore.setDocument(this.type, id, null)
  }

  create(id, data) {
    if (id == null) return null
    return this.remoteStore.setDocument(this.type, id, data)
  }

  createAtPosition(id, data, x, y, z=0) {
    return this.create(id, {
      ...data,
      position: { x, y, z },
    })
  }
}

export default RoomCollection
