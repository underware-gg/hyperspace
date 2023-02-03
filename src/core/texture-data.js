//-------------------------------
// World tilesets
//
export const tilesets = [
  '/tilesets/library.png',
  '/tilesets/dungeon.png',
  '/tilesets/warehouse.png',
]
export const defaultTileset = tilesets[0];

//-------------------------------
// Character spritesheets
//
const schoolSet = {
  scale: 1.25,
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
  { sprites: japanSet, src: '/spritesheets/japan/Boy1.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Boy2.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Boy3.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Boy4.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Girl1.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Girl2.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Girl3.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Girl4.png' },
  { sprites: japanSet, src: '/spritesheets/japan/JPop.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Child.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Andy.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Punk1.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Punk2.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Cop.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Ronin.png' },
  { sprites: japanSet, src: '/spritesheets/japan/OnnaMusha.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Witch.png' },
  { sprites: japanSet, src: '/spritesheets/japan/Doge.png' },
  { sprites: schoolSet, src: '/spritesheets/school/TeacherMale.png' },
  { sprites: schoolSet, src: '/spritesheets/school/TeacherFemale.png' },
  { sprites: schoolSet, src: '/spritesheets/school/StudentMale.png' },
  { sprites: schoolSet, src: '/spritesheets/school/StudentFemale.png' },
  { sprites: schoolSet, src: '/spritesheets/school/StudentBike.png' },
  { sprites: ghostSet, src: '/spritesheets/ghost/Blinky.png' },
  { sprites: ghostSet, src: '/spritesheets/ghost/Pinky.png' },
  { sprites: ghostSet, src: '/spritesheets/ghost/Inky.png' },
  { sprites: ghostSet, src: '/spritesheets/ghost/Clyde.png' },
  // { src: '/spritesheets/ghost/ghost2.png', scale: 2 }, // flat image works too!
]
export const defaultSpritesheet = spritesheets[0];

//-------------------------------
// Character spritesheets
//
export const textureData = {
  // 'player': {
  //   src: '/spritesheets/ghost/ghost2.png',
  //   // scale: 2,
  // },
  'player': defaultSpritesheet,
  'tileset': {
    src: defaultTileset,
  },
  'portal': {
    src: '/tiles/portal.png',
  },
  // matching screen types
  'document': {
    src: '/tiles/screen_document.png',
  },
  'document_over': {
    src: '/tiles/screen_document2.png',
  },
  'pdf_book': {
    src: '/tiles/screen_book.png',
  },
  'pdf_book_over': {
    src: '/tiles/screen_book2.png',
  },
}
