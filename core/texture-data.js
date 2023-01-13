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
      cycles: {
        idle: [[0, 0]],
        walkDown: [[0, 0], [1, 0], [2, 0], [1, 0]],
        walkRight: [[0, 1], [1, 1], [2, 1], [1, 1]],
        walkUp: [[0, 2], [1, 2], [2, 2], [1, 2]],
        walkLeft: [[0, 3], [1, 3], [2, 3], [1, 3]],
      }
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
