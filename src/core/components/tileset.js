import RoomCollection from '@/core/interfaces/RoomCollection'

class Tileset extends RoomCollection {
  constructor(room) {
    super(room, 'tileset')
  }

  createTileset(id, name, width, height, blob) {
    return this.create(id, {
      name,
      blob,
      size: { width, height },
    })
  }

}

export default Tileset
