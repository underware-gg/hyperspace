//-------------------------------
// World tilesets
//
export const TilesetPaths = {
  Castle: '/tilesets/castle.png',
  Library: '/tilesets/library.png',
  Dungeon: '/tilesets/dungeon.png',
  Warehouse: '/tilesets/warehouse.png',
  Quest1: '/tilesets/quest1.png',
  Quest2: '/tilesets/quest2.png',
  Quest3: '/tilesets/quest3.png',
  Quest4: '/tilesets/quest4.png',
}
export const tilesets = [
  { src: TilesetPaths.Castle },
  { src: TilesetPaths.Library },
  { src: TilesetPaths.Dungeon },
  { src: TilesetPaths.Warehouse },
  // { src: TilesetPaths.Quest1 },
  // { src: TilesetPaths.Quest2 },
  // { src: TilesetPaths.Quest3 },
  // { src: TilesetPaths.Quest4 },
]
export const defaultTileset = tilesets[0]

//-------------------------------
// Character spritesheets
//
const schoolSet = {
  scale: 1,
  rows: 4,
  columns: 3,
  cycles: {
    idle: [[0, 0]],
    walkDown: [[0, 0], [1, 0], [2, 0], [1, 0]],
    walkRight: [[0, 1], [1, 1], [2, 1], [1, 1]],
    walkUp: [[0, 2], [1, 2], [2, 2], [1, 2]],
    walkLeft: [[0, 3], [1, 3], [2, 3], [1, 3]],
  },
  template: '/spritesheets/school/SchoolTemplate.png',
}
const japanSet = {
  scale: 1,
  rows: 5,
  columns: 8,
  cycles: {
    idle: [[0, 0]],
    walkRight: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1]],
    walkUp: [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2]],
    walkDown: [[0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3]],
    walkLeft: [[0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4]],
  },
  stepScale: 0.75,
  template: '/spritesheets/japan/Template.png',
}
const ghostSet = {
  scale: 1.5,
  rows: 1,
  columns: 4,
  cycles: {
    idle: [[0, 0]],
    walkRight: [[0, 0], [1, 0]],
    walkUp: [[0, 0], [3, 0]],
    walkDown: [[1, 0], [2, 0]],
    walkLeft: [[2, 0], [3, 0]],
  },
  stepScale: 0.75,
  template: '/spritesheets/ghost/GhostTemplate.png',
}
export const spritesheets = [
  { sprites: japanSet, src: '/spritesheets/japan/Blair.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Corey.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Jamie.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Lee.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Alex.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Jan.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Kit.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Lex.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Ellis.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Poppy.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Sol.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Rocky.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Punky.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Witchy.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Ronin.png' },
  { sprites: japanSet, src: '/spritesheets/japan/OnnaMusha.png' },
  { sprites: schoolSet, src: '/spritesheets/school/Madison.png' },
  { sprites: schoolSet, src: '/spritesheets/school/Morgan.png' },
  { sprites: schoolSet, src: '/spritesheets/school/Kim.png' },
  { sprites: schoolSet, src: '/spritesheets/school/Kai.png' },
  { sprites: schoolSet, src: '/spritesheets/school/Harley.png' },
  { sprites: ghostSet, src: '/spritesheets/ghost/Blinky.png' },
  { sprites: ghostSet, src: '/spritesheets/ghost/Pinky.png' },
  { sprites: ghostSet, src: '/spritesheets/ghost/Inky.png' },
  { sprites: ghostSet, src: '/spritesheets/ghost/Clyde.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Doge.png' },
  // { src: '/spritesheets/ghost/ghost2.png', scale: 2 }, // flat image works too!
]

//-------------------------------
// Character spritesheets
//
export const textureData = {
  'tileset': defaultTileset,
  'portal': {
    src: '/tiles/portal.png',
  },
  'entry': {
    src: '/tiles/door.png',
  },
  // matching screen types
  'document': {
    src: '/tiles/screen_document.png',
  },
  'document_over': {
    src: '/tiles/screen_document2.png',
  },
  'metadata': {
    src: '/tiles/screen_metadata.png',
  },
  'metadata_over': {
    src: '/tiles/screen_metadata.png',
  },
  'pdf_book': {
    src: '/tiles/screen_book.png',
  },
  'pdf_book_over': {
    src: '/tiles/screen_book2.png',
  },
  'trigger_0': {
    src: '/tiles/trigger_0.png',
  },
  'trigger_1': {
    src: '/tiles/trigger_1.png',
  },
  'gravity': {
    src: '/gravity.jpg',
  },
  'gridtile': {
    src: '/tiles/gridtile.png',
  },
  'Ethereum': {
    src: '/icons/Ethereum.svg',
  },
  'Verida': {
    src: '/icons/Verida.png',
  },
}
