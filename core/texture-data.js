export const tilesets = [
  '/tilesets/library.png',
  '/tilesets/dungeon.png',
  '/tilesets/warehouse.png',
]
export const defaultTileset = tilesets[0];

export const textureData = {
  'player': {
    src: '/spritesheets/teacher_male.png',
    scale: 1.25,
    sprites: {
      rows: 4,
      columns: 3,
    }
  },
  'tileset': {
    src: defaultTileset,
  },
  'book': {
    src: 'book.png',
  },
  'portal': {
    src: 'portal.png',
  },
}
