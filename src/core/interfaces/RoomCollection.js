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
    return this.remoteStore.hasDocument(this.type, id)
  }

  get(id) {
    return this.remoteStore.getDocument(this.type, id)
  }

  remove(id, checkPermission = false) {
    if (id == null) return
    const data = this.remoteStore.getDocument(this.type, id)
    if (data == null) return
    if (checkPermission && !this.canEdit(id)) {
      console.warn(`No permission to delete [${this.type}] (${id})`)
      return
    }
    this.remoteStore.setDocument(this.type, id, null)
  }

  upsert(id, newData, checkPermission = false) {
    if (checkPermission && !this.canEdit(id)) {
      console.warn(`No permission to create/update [${this.type}] (${id})`)
      return
    }
    return this.remoteStore.upsertDocument(this.type, id, newData)
  }

  createAtPosition(id, data, x, y, z=0) {
    if (id == null) return
    return this.upsert(id, {
      ...data,
      position: { x, y, z },
    })
  }

  canView(id) {
    return this.Permission.hasPermissionToView('world') && this.Permission.hasPermissionToView(id)
  }

  canEdit(id) {
    if (this.remoteStore == null) return false // do not edit while room is loading
    return this.Permission.hasPermissionToView('world') && this.Permission.hasPermissionToEdit(id)
  }
}

export default RoomCollection
