import RoomCollection from '@/core/interfaces/RoomCollection'

class Tileset extends RoomCollection {
  constructor(room) {
    super(room, 'tileset')
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
