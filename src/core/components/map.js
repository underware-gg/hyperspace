import * as THREE from 'three'
import RoomCollection from '@/core/interfaces/RoomCollection'
import { getTextureImageByName } from '@/core/textures'
import { defaultTileset } from '@/core/texture-data'
import { clamp } from '@/core/utils'

export const MIN_MAP_SIZE = 5
export const MAX_MAP_SIZE = 20

export const DEFAULT_MAP_WIDTH = 20
export const DEFAULT_MAP_HEIGHT = 15

export const DEFAULT_MAP_TILE = 4

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

    this.patched = false

    this.clientRoom.on('patched', (patched) => {
      if (this.patched) return

      console.log(`[${this.slug}] PATCHED MAP:`, patched, `exists:`, this.exists('world'))

      if (!this.exists('world')) {
        this.resetMap('world')
      }

      // update old maps with smaller map size
      let map = this.remoteStore.getDocument('map', 'world')
      if (Object.keys(map).length < MAX_MAP_SIZE) {
        while (Object.keys(map).length < MAX_MAP_SIZE) {
          map[Object.keys(map).length] = new Array(MAX_MAP_SIZE).fill(null)
        }
        this.remoteStore.setDocument('map', 'world', map)
      }

      this.init2D('world')
      this.init3D('world')

      this.patched = true
    })

    // texture swapping
    this.remoteStore.on({ type: 'tileset', event: 'change' }, (id, tileset) => {
      if (id === 'world') {
        this.swapTileset(id, tileset)
      }
    })

    this.actions.addActionDownListener('toggleGravityMap', () => {
      const gravityMap = this.localStore.getDocument('editGravityMap', 'world') ? false : true
      this.localStore.setDocument('editGravityMap', 'world', gravityMap)
    })

    // texture swapping
    this.localStore.on({ type: 'editGravityMap', event: 'change' }, (id, enabled) => {
      this.init2D(id)
    })
  }

  init2D = (id) => {
    const settings = this.Settings.get(id)
    const gravityMap = this.localStore.getDocument('editGravityMap', id) ?? false

    // canvas size in pixels
    const canvasWidth = process.env.RENDER_WIDTH
    const canvasHeight = process.env.RENDER_HEIGHT

    // map size in tiles
    const mapWidth = gravityMap ? MAX_MAP_SIZE : Math.max(settings.size.width, DEFAULT_MAP_WIDTH)
    const mapHeight = gravityMap ? MAX_MAP_SIZE : Math.max(settings.size.height, DEFAULT_MAP_HEIGHT)

    // tile size inside canvas, in pixels
    const scale = Math.min(canvasWidth / mapWidth, canvasHeight / mapHeight)

    // viewport 'camera' offset
    const offset = {
      x: (canvasWidth / scale) / 2,
      y: (canvasHeight / scale) / 2,
    }

    // map start, used to draw tiles in map space
    const start = {
      x: -(gravityMap ? MAX_MAP_SIZE : settings.size.width) / 2,
      y: -(gravityMap ? MAX_MAP_SIZE : settings.size.height) / 2,
    }

    // tiles grid, for easy reference
    const tiles = []
    for (let y = 0; y < mapHeight; y++) {
      const row = []
      for (let x = 0; x < mapWidth; x++) {
        row.push({
          start: {
            x,
            y,
          },
          end: {
            x: x + 1,
            y: y + 1,
          }
        })
      }
      tiles.push(row)
    }

    this.viewport = {
      offset,
      scale,
      start,
      tiles,
    }
  }

  init3D = (id) => {
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

    const settings = this.Settings.get(id)

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

    this.localStore.setDocument('map3d', id, map3D)
    this.localStore.setDocument('floor-geometries', id, floorGeometries)
    this.localStore.setDocument('wall-geometries', id, wallGeometries)
    this.localStore.setDocument('material-uv', id, materialUV)
    this.localStore.setDocument('gridContainer', 'gridContainer', gridContainer)
  }

  resetMap(id) {
    let map = []

    for (let y = 0; y < MAX_MAP_SIZE; y++) {
      map.push(new Array(MAX_MAP_SIZE).fill(null))
    }

    const settings = this.remoteStore.getDocument('settings', id)

    for (let y = 0; y < clamp(settings.size.height, MIN_MAP_SIZE, MAX_MAP_SIZE); y++) {
      const row = this.viewport.tiles[y]
      for (let x = 0; x < clamp(settings.size.width, MIN_MAP_SIZE, MAX_MAP_SIZE); x++) {
        map[y][x] = DEFAULT_MAP_TILE
      }
    }

    this.remoteStore.setDocument('map', id, map)
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

  render2d(id, context, canvas) {
    if (!this.viewport) return // not initialized

    const map = this.remoteStore.getDocument('map', id)

    if (map === null) {
      console.log(`[${this.slug}] Map.render2d() Map [${id}] is null`)
      return
    }

    // reset canvas matrix
    context.resetTransform()

    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.rect(0, 0, canvas.width, canvas.height)
    context.fillStyle = 'black'
    context.fill()

    // set draw matrix for all 2D elements
    // position viewport/camera at the center of the map
    context.scale(this.viewport.scale, this.viewport.scale)
    context.translate(this.viewport.offset.x, this.viewport.offset.y)

    // translate to map start so all subsequent draws are in map space
    context.translate(this.viewport.start.x, this.viewport.start.y)

    // store current save matrix
    this.canvasTransform = context.getTransform()
    this.canvasInverseTransform = this.canvasTransform.inverse()

    const gravityMap = this.localStore.getDocument('editGravityMap', id) ?? false
    if (gravityMap) {
      const gravityImage = getTextureImageByName('gravity')
      // context.save()
      // context.translate(this.viewport.start.x, this.viewport.start.y)
      context.drawImage(gravityImage, 0, 0, MAX_MAP_SIZE, MAX_MAP_SIZE)
      // context.restore()

      const gridImage = getTextureImageByName('gridtile')
      for (let x = 0; x < MAX_MAP_SIZE; x++) {
        for (let y = 0; y < MAX_MAP_SIZE; y++) {
          context.drawImage(gridImage, x, y, 1, 1)
        }
      }

    }

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

    const settings = this.remoteStore.getDocument('settings', id)

    const mapWidth = gravityMap ? MAX_MAP_SIZE : settings.size.width
    const mapHeight = gravityMap ? MAX_MAP_SIZE : settings.size.height

    for (let y = 0; y < mapHeight; y++) {
      const row = this.viewport.tiles[y]
      for (let x = 0; x < mapWidth; x++) {
        let tileIndex = map[y]?.[x] ?? null
        if (tileIndex == null || tileIndex < 0 || tileIndex > 9) continue

        const tile = row[x]
        context.drawImage(
          image,
          tileIndex * imageTileSize,
          0,
          imageTileSize,
          imageTileSize,
          tile.start.x,
          tile.start.y,
          1,
          1,
        )
      }
    }

    const { entry } = settings
    this.drawTextureAtTile(context, entry.x, entry.y, 'entry')
  }

  drawTextureAtTile(context, x, y, textureName, altTextureName = null) {
    if (!this.viewport) return // not initialized

    if (!this.validateTile(x, y)) return

    const texture = getTextureImageByName(textureName, altTextureName)
    if (texture == null) {
      console.warn(`Map.drawTextureAtTile(${textureName}, ${altTextureName}) not found`)
      return
    }

    const tile = this.viewport.tiles[y][x]
    context.drawImage(
      texture,
      tile.start.x,
      tile.start.y,
      1,
      1,
    )
  }

  drawRect(context, x, y, width, height, lineWidth, color) {
    if (!this.viewport) return // not initialized
    context.lineWidth = lineWidth
    context.strokeStyle = color
    context.strokeRect(
      x,
      y,
      width,
      height,
    )
  }

  validateTile(x, y) {
    if (!this.viewport) return false // not initialized

    const gravityMap = this.localStore.getDocument('editGravityMap', 'world') ?? false
    const settings = this.Settings.get('world')
    
    const mapWidth = gravityMap ? MAX_MAP_SIZE : settings.size.width
    const mapHeight = gravityMap ? MAX_MAP_SIZE : settings.size.height
        
    return (x != null && x >= 0 && x < mapWidth && y != null && y >= 0 && y < mapHeight)
  }

  getTile(id, x, y) {
    if (!this.validateTile(x, y)) {
      return null
    }
    const map = this.remoteStore.getDocument('map', id)
    return map?.[y]?.[x] ?? null
  }

  canvasPositionToTile(x, y) {
    const m = this.canvasInverseTransform
    
    if (!this.Map.viewport || !m) {
      return null // not initialized
    }

    const tile = {
      x: Math.floor(m.a * x + m.c * y + m.e),
      y: Math.floor(m.b * x + m.d * y + m.f),
    }

    // if (!this.validateTile(tile.x, tile.y)) {
    //   return null
    // }

    return tile
  }

  render3d(id) {
    const map = this.remoteStore.getDocument('map', id)

    if (map === null) {
      return
    }

    const map3D = this.localStore.getDocument('map3d', id)

    if (map3D === null) {
      return
    }

    const floorGeometries = this.localStore.getDocument('floor-geometries', id)

    if (floorGeometries === null) {
      return
    }

    const wallGeometries = this.localStore.getDocument('wall-geometries', id)

    if (wallGeometries === null) {
      return
    }

    const settings = this.Settings.get(id)

    for (let x = 0; x < settings.size.width; x++) {
      for (let y = 0; y < settings.size.height; y++) {
        let mapCell = map3D[settings.size.height - 1 - y][x]

        let tileIndex = map[y][x]
        if (typeof tileIndex != 'number' || tileIndex < 0 || tileIndex > 9) {
          mapCell.mesh.visible = false
        } else {
          mapCell.mesh.visible = true
          mapCell.mesh.geometry = floorGeometries[tileIndex]
          mapCell.mesh.position.z = walls[tileIndex]

          const updateGeometries = (wallStack) => {
            wallStack.children.forEach(element => {
              element.geometry = wallGeometries[tileIndex]
            })
          }
          updateGeometries(mapCell.walls.stack1)
          updateGeometries(mapCell.walls.stack2)
          updateGeometries(mapCell.walls.stack3)
        }
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
