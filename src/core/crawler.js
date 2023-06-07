import * as Crawler from '@rsodre/crawler-data'
import { MAX_MAP_SIZE } from '@/core/components/map'
import { TilesetPaths } from './texture-data'

export const crawlerSlugToChamberData = (slug) => {
  if (!Crawler.validateSlug(slug)) {
    console.log(`crawlerSlugToChamberData() Invalid slug:`, slug)
    return null
  }
  const coord = Crawler.slugToCoord(slug)
  const chamberData = Crawler.getChamberData(coord)
  return chamberData
}

export const crawlerSlugToRoom = (slug) => {
  const chamberData = crawlerSlugToChamberData(slug)
  if (!chamberData) return null

  let result = {
    ...chamberData,
    map: [],
    entry: {},
    tileset: null,
  }

  const PATH = 4
  const DOOR = 0
  const GEM = 3
  const PERIM = 5
  const WALL = 6

  // initialize map
  for (let y = 0; y < MAX_MAP_SIZE.height; ++y) {
    result.map.push(new Array(MAX_MAP_SIZE.width).fill(null))
  }

  // perimeter
  let start = {
    x: (MAX_MAP_SIZE.width - 20) / 2,
    y: (MAX_MAP_SIZE.height - 20) / 2,
  }
  for (let y = 0; y < 20; ++y) {
    for (let x = 0; x < 20; ++x) {
      result.map[start.y + y][start.x + x] = PERIM
    }
  }

  start = {
    x: (MAX_MAP_SIZE.width - 16) / 2,
    y: (MAX_MAP_SIZE.height - 16) / 2,
  }

  for (let i = 0; i < 256; ++i) {
    const chamberTile = chamberData.tilemap[i]
    const isDoor = chamberData.doors.includes(i)
    const isGem = (i == chamberData.gemPos)
    const x = start.x + (i % 16)
    const y = start.y + Math.floor(i / 16)
    const tile = isDoor ? DOOR : isGem ? GEM : chamberTile == 0 ? WALL : PATH
    result.map[y][x] = tile
    if (i == chamberData.doors[Crawler.Dir.North]) { result.map[y - 1][x] = tile, result.map[y - 2][x] = tile }
    if (i == chamberData.doors[Crawler.Dir.East]) { result.map[y][x + 1] = tile, result.map[y][x + 2] = tile }
    if (i == chamberData.doors[Crawler.Dir.West]) { result.map[y][x - 1] = tile, result.map[y][x - 2] = tile }
    if (i == chamberData.doors[Crawler.Dir.South]) { result.map[y + 1][x] = tile, result.map[y + 2][x] = tile }
    if (i == chamberData.doors[chamberData.entryDir]) { result.entry = { x, y } }
  }

  result.tileset =
    chamberData.terrain == Crawler.Terrain.Earth ? TilesetPaths.Library :
      chamberData.terrain == Crawler.Terrain.Water ? TilesetPaths.Warehouse :
        chamberData.terrain == Crawler.Terrain.Air ? TilesetPaths.Castle :
          chamberData.terrain == Crawler.Terrain.Fire ? TilesetPaths.Dungeon :
            null

  // console.log(`crawlerSlugToRoom()`, result)
  return result
}

