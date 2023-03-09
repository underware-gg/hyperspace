import RoomMate from '@/core/interfaces/RoomMate'

class Tileset extends RoomMate {
  constructor(room) {
    super(room)
  }

  create(id, tileset) {
    this.remoteStore.setDocument('tileset', id, tileset)
    return tileset
  }

  remove(id) {
    this.remoteStore.setDocument('tileset', id, null)
  }

  exists(id) {
    const tileset = this.remoteStore.getDocument('tileset', id)
    return tileset !== null
  }

}

export default Tileset
