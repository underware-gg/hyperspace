import * as THREE from 'three'
import RoomCollection from '@/core/interfaces/RoomCollection'
import { getTextureImageByName } from '@/core/textures'
import { defaultTileset } from '@/core/texture-data'
import { clamp } from '@/core/utils'
import { tileset } from '../merge/crdt-type'

const defaultMap = [
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
]

const cellWidth = 1

export const walls = [
  -.25,
  .1,
  1.5,
  .5,
  0,
  2,
  1.5,
  1.75,
  -.25,
  1,
]

export const floors = [
  -0.75,
  .1,
  1.5,
  .5,
  0,
  2,
  1.5,
  1.75,
  -0.75,
  1,
]

class Map extends RoomCollection {
  constructor(room) {
    super(room, 'map')

    this.clientRoom.on('patched', (patched) => {
      console.log(`[${this.slug}] PATCHED MAP:`, patched, `exists:`, this.exists('world'))
      if (!this.exists('world')) {
        this.resetMap('world')
      }
      
      // update old maps with smaller map size
      let map = this.remoteStore.getDocument('map', 'world')
      if (Object.keys(map).length < Object.keys(defaultMap).length) {
        while (Object.keys(map).length < Object.keys(defaultMap).length) {
          map[Object.keys(map).length] = defaultMap[Object.keys(map).length]
        }
        this.remoteStore.setDocument('map', 'world', map)
      }
      
      this.init2D()
      this.init3D()
    })

    // texture swapping
    this.remoteStore.on({ type: 'tileset', event: 'change' }, (id, tileset) => {
      if (id === 'world') {
        this.swapTileset(id, tileset)
      }
    })
  }

  init2D = () => {
    const settings = this.Settings.get('world')

    // canvas size in pixels
    const canvasWidth = process.env.CANVAS_WIDTH
    const canvasHeight = process.env.CANVAS_HEIGHT

    // map size in tiles
    const mapWidth = settings.size.width
    const mapHeight = settings.size.height
    
    // tile size inside canvas, in pixels
    const tileSize = Math.min(Math.min(canvasWidth / mapWidth, canvasHeight / mapHeight), process.env.BASE_TILE_SIZE)

    // map bounds inside canvas, in pixels
    const start = {
      x: (canvasWidth - (mapWidth * tileSize)) / 2,
      y: (canvasHeight - (mapHeight * tileSize)) / 2,
    }
    const end = {
      x: start.x + (mapWidth * tileSize),
      y: start.y + (mapHeight * tileSize),
    }

    const tiles = []
    for (let y = 0; y < mapHeight; y++) {
      const row = []
      for (let x = 0; x < mapWidth; x++) {
        const _x = start.x + (x * tileSize)
        const _y = start.y + (y * tileSize)
        row.push({
          start: {
            x: _x,
            y: _y,
          },
          end: {
            x: _x + tileSize,
            y: _y + tileSize,
          }
        })
      }
      tiles.push(row)
    }
    // console.log(`TILE SIZE`, tileSize, start, end, tiles)

    this.tileMap = {
      start,
      end,
      tileSize,
      tiles,
    }
  }

  init3D = () => {
    const scene = this.localStore.getDocument('scene', 'scene')

    if (scene == null) {
      return // no 3d render
    }

    ////////////
    //3D STUFF//
    ////////////
    const geometryFloor = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)
    const geometryWall = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)

    const geometryFloorUV0 = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)
    const geometryFloorUV1 = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)
    const geometryFloorUV2 = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)
    const geometryFloorUV3 = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)
    const geometryFloorUV4 = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)
    const geometryFloorUV5 = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)
    const geometryFloorUV6 = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)
    const geometryFloorUV7 = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)
    const geometryFloorUV8 = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)
    const geometryFloorUV9 = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)

    const geometryWallUV0 = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)
    const geometryWallUV1 = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)
    const geometryWallUV2 = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)
    const geometryWallUV3 = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)
    const geometryWallUV4 = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)
    const geometryWallUV5 = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)
    const geometryWallUV6 = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)
    const geometryWallUV7 = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)
    const geometryWallUV8 = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)
    const geometryWallUV9 = new THREE.PlaneGeometry(cellWidth, cellWidth, 1, 1)

    const loader = new THREE.TextureLoader()

    const materialUV = new THREE.MeshLambertMaterial({
      map: loader.load(defaultTileset.src),
    })
    materialUV.map.minFilter = THREE.NearestFilter
    materialUV.map.magFilter = THREE.NearestFilter

    const floorGeometries = [
      geometryFloorUV0,
      geometryFloorUV1,
      geometryFloorUV2,
      geometryFloorUV3,
      geometryFloorUV4,
      geometryFloorUV5,
      geometryFloorUV6,
      geometryFloorUV7,
      geometryFloorUV8,
      geometryFloorUV9,
    ]

    const wallGeometries = [
      geometryWallUV0,
      geometryWallUV1,
      geometryWallUV2,
      geometryWallUV3,
      geometryWallUV4,
      geometryWallUV5,
      geometryWallUV6,
      geometryWallUV7,
      geometryWallUV8,
      geometryWallUV9,
    ]

    const setUV = (plane, index) => {
      const uvs = new Float32Array([
        0.1 * index, 1,
        0.1 * index + 0.1, 1,
        0.1 * index, 0,
        0.1 * index + 0.1, 0
      ])

      plane.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    }

    for (let i = 0; i < floorGeometries.length; i++) {
      setUV(floorGeometries[i], i)
      setUV(wallGeometries[i], i)
    }

    const gridContainer = new THREE.Object3D()

    const settings = this.Settings.get('world')

    let map3D = new Array(settings.size.width)
    for (let x = 0; x < settings.size.width; x++) {
      map3D[x] = new Array(settings.size.height)
    }

    const MakeWall = (object3D) => {
      let wall3Dn = new THREE.Mesh(geometryWall, materialUV)
      let wall3Ds = new THREE.Mesh(geometryWall, materialUV)
      let wall3De = new THREE.Mesh(geometryWall, materialUV)
      let wall3Dw = new THREE.Mesh(geometryWall, materialUV)

      wall3Dn.visible = true
      wall3Ds.visible = true
      wall3De.visible = true
      wall3Dw.visible = true

      wall3Dn.position.y = cellWidth / 2
      wall3Ds.position.y = -cellWidth / 2

      wall3De.position.x = -cellWidth / 2
      wall3Dw.position.x = cellWidth / 2

      wall3Dn.rotateX(Math.PI / 2)
      wall3Dn.rotateY(Math.PI)

      wall3Ds.rotateX(Math.PI / 2)
      wall3Ds.rotateY(0)

      wall3De.rotateX(Math.PI / 2)
      wall3De.rotateY(-Math.PI / 2)

      wall3Dw.rotateX(Math.PI / 2)
      wall3Dw.rotateY(Math.PI / 2)

      object3D.add(wall3De)
      object3D.add(wall3Dw)
      object3D.add(wall3Dn)
      object3D.add(wall3Ds)
    }

    for (let x = 0; x < settings.size.width; x++) {
      for (let y = 0; y < settings.size.height; y++) {
        let gridCell3D = new THREE.Mesh(geometryFloor, materialUV)

        const wallStack1 = new THREE.Object3D()
        const wallStack2 = new THREE.Object3D()
        const wallStack3 = new THREE.Object3D()

        MakeWall(wallStack1)
        MakeWall(wallStack2)
        MakeWall(wallStack3)

        wallStack1.position.z = -2.5
        wallStack2.position.z = -1.5
        wallStack3.position.z = -0.5

        gridCell3D.add(
          wallStack1,
          wallStack2,
          wallStack3,
        )

        map3D[y][x] = {
          mesh: gridCell3D,
          walls: {
            stack1: wallStack1,
            stack2: wallStack2,
            stack3: wallStack3,
          },
        }

        const pos = {
          x: x * cellWidth + cellWidth * 0.5,
          y: y * cellWidth - settings.size.height * cellWidth - cellWidth * 0.5,
        }

        gridCell3D.position.x = pos.x
        gridCell3D.position.y = pos.y + cellWidth

        gridContainer.add(gridCell3D)
      }
    }

    scene.add(gridContainer)

    this.localStore.setDocument('map3d', 'world', map3D)
    this.localStore.setDocument('floor-geometries', 'world', floorGeometries)
    this.localStore.setDocument('wall-geometries', 'world', wallGeometries)
    this.localStore.setDocument('material-uv', 'world', materialUV)
    this.localStore.setDocument('gridContainer', 'gridContainer', gridContainer)
  }

  resetMap(id) {
    this.upsert(id, defaultMap)
  }

  updateMeshPositionToMap(mesh, position) {
    if (mesh === null) return

    const tile = this.getTile('world', position.x, position.y)
    if (tile === null) return

    const currentFloorHeight = floors[tile]

    mesh.geometry.computeBoundingBox()
    const bbox = mesh.geometry.boundingBox

    mesh.position.set(
      (Math.floor(position.x) + 0.5),
      -(Math.floor(position.y) + 0.5),
      currentFloorHeight + (bbox.max.z - bbox.min.z) * 0.5,
    )
  }

  updateTile(id, x, y, value) {
    const map = this.remoteStore.getDocument('map', id)

    if (map === null) {
      return
    }

    if (!this.validateTile(x, y)) {
      return
    }

    if (map[y][x] === value) {
      return
    }

    this.remoteStore.setValueAtPath('map', id, `/${y}.${x}`, value)
  }

  render2d(id, context) {
    if (!this.tileMap) return // not initialized

    const map = this.remoteStore.getDocument('map', id)

    if (map === null) {
      console.log(`[${this.slug}] Map.render2d() Map [${id}] is null`)
      return
    }

    // set draw matrix for all 2D elements
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(process.env.CANVAS_SCALE, process.env.CANVAS_SCALE)
    context.clearRect(0, 0, process.env.CANVAS_WIDTH, process.env.CANVASHEIGHT)

    const crdtTileset = this.remoteStore.getDocument('tileset', id)

    let image
    let imageTileSize

    if (crdtTileset?.blob) {
      image = new Image()
      image.src = crdtTileset.blob
      imageTileSize = crdtTileset.size.height ?? 32
    } else {
      image = getTextureImageByName(crdtTileset?.name ?? 'tileset')
      imageTileSize = image?.height ?? 32
    }

    const settings = this.remoteStore.getDocument('settings', 'world')

    // console.log(`render`, crdtTileset, image, sz, settings)

    for (let x = 0; x < settings.size.width; x++) {
      for (let y = 0; y < settings.size.height; y++) {
        const tile = this.tileMap.tiles[y][x]
        const tileIndex = clamp(map[y][x], 0, 9)
        context.drawImage(
          image,
          tileIndex * imageTileSize,
          0,
          imageTileSize,
          imageTileSize,
          tile.start.x,
          tile.start.y,
          this.tileMap.tileSize,
          this.tileMap.tileSize,
        )
      }
    }

    const { entry } = settings
    this.drawTextureAtTile(context, entry.x, entry.y, 'entry')
  }

  drawTextureAtTile(context, x, y, textureName, altTextureName = null) {
    if (!this.tileMap) return // not initialized

    if (!this.validateTile(x, y)) return

    const texture = getTextureImageByName(textureName, altTextureName)
    if (texture == null) {
      console.warn(`Map.drawTextureAtTile(${textureName}, ${altTextureName}) not found`)
      return
    }

    const tile = this.tileMap.tiles[y][x]
    context.drawImage(
      texture,
      tile.start.x,
      tile.start.y,
      this.tileMap.tileSize,
      this.tileMap.tileSize,
    )
  }

  validateTile(x, y) {
    if (!this.tileMap) return false // not initialized
    const settings = this.Settings.get('world')
    return (x != null && x >= 0 && x < settings.size.width && y != null && y >= 0 && y < settings.size.height)
  }

  getTile(id, x, y) {
    if (!this.validateTile(x, y)) {
      return null
    }

    const map = this.remoteStore.getDocument('map', id)
    if (map === null) return null

    const tile = map[y][x]

    return clamp(tile, 0, 9)
  }

  render3d(id) {
    const map = this.remoteStore.getDocument('map', id)

    if (map === null) {
      return
    }

    const map3D = this.localStore.getDocument('map3d', 'world')

    if (map3D === null) {
      return
    }

    const floorGeometries = this.localStore.getDocument('floor-geometries', 'world')

    if (floorGeometries === null) {
      return
    }

    const wallGeometries = this.localStore.getDocument('wall-geometries', 'world')

    if (wallGeometries === null) {
      return
    }

    const settings = this.Settings.get('world')

    for (let x = 0; x < settings.size.width; x++) {
      for (let y = 0; y < settings.size.height; y++) {
        let mapCell = map3D[settings.size.height - 1 - y][x]

        const tile = clamp(map[y][x], 0, 9)

        mapCell.mesh.geometry = floorGeometries[tile]

        mapCell.mesh.position.z = walls[tile]

        const updateGeometries = (wallStack) => {
          wallStack.children.forEach(element => {
            element.geometry = wallGeometries[tile]
          })
        }
        updateGeometries(mapCell.walls.stack1)
        updateGeometries(mapCell.walls.stack2)
        updateGeometries(mapCell.walls.stack3)
      }
    }
  }

  swapTileset(id, tileset) {
    if (id !== 'world') {
      return
    }

    const materialUV = this.localStore.getDocument('material-uv', id)

    if (materialUV === null) {
      return
    }

    const loader = new THREE.TextureLoader()

    materialUV.map = loader.load(tileset?.blob ?? tileset?.name ?? defaultTileset.src)
    materialUV.map.magFilter = THREE.NearestFilter
    materialUV.map.minFilter = THREE.NearestFilter

    materialUV.needsUpdate = true
  }

}

export default Map
