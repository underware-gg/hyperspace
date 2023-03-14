import RoomCollection from '@/core/interfaces/RoomCollection'

class Tileset extends RoomCollection {
  constructor(room) {
    super(room, 'tileset')
  }

  updateTileset(id, name, width, height, blob) {
    const data = {
      name,
      blob,
      size: { width, height },
      blob,
    }
    return this.upsert(id, data, true)
  }

}

export default Tileset
