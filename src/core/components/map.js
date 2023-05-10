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

const defaultBounds = {
  start: {
    x: 0,
    y: 0,
  },
  end: {
    x: MAX_MAP_SIZE - 1,
    y: MAX_MAP_SIZE - 1,
  }
}

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

      const mapExists = this.exists('world')
      console.log(`[${this.slug}] PATCHED MAP:`, patched, `exists:`, mapExists)

      if (!mapExists) {
        this.resetMap('world')
      }

      // update older maps created with a 20x15 grid
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

    this.remoteStore.on({ type: 'map', event: 'change' }, (id, map) => {
      this.init2D(id)
    })

    this.actions.addActionDownListener('toggleGravityMap', () => {
      const gravityMap = this.localStore.getDocument('editGravityMap', 'world') ? false : true
      this.localStore.setDocument('editGravityMap', 'world', gravityMap)
    })

    this.actions.addActionDownListener('toggle3d', () => {
      const profile = this.Profile.getCurrentProfile()

      let view3d = (profile ? !profile.view3d : true) && this.canvas3d != null

      this.Profile.updateCurrentProfile({
        view3d
      })

      this.localStore.setDocument('editGravityMap', 'world', false)
    })


    this.localStore.on({ type: 'editGravityMap', event: 'change' }, (id, enabled) => {
      if (enabled) {
        this.Profile.updateCurrentProfile({ view3d: false })
      }
      this.init2D(id)
    })
  }

  calculateMapBounds = (id) => {
    const settings = this.Settings.get(id)
    const entry = settings.entry
    const map = this.remoteStore.getDocument('map', id)

    let start = { ...entry }
    let end = { ...entry }

    // find x start/end
    for (let x = 0; x < MAX_MAP_SIZE; x++) {
      let filled = false
      for (let y = 0; y < MAX_MAP_SIZE && !filled; y++) {
        if (map[y]?.[x] != null) {
          filled = true
        }
      }
      if (filled && x < entry.x && start.x == entry.x) {
        start.x = x
      }
      if (filled && x > entry.x) {
        end.x = x
      }
    }

    // find y start/end
    for (let y = 0; y < MAX_MAP_SIZE; y++) {
      let filled = false
      for (let x = 0; x < MAX_MAP_SIZE && !filled; x++) {
        if (map[y]?.[x] != null) {
          filled = true
        }
      }
      if (filled && y < entry.y && start.y == entry.y) {
        start.y = y
      }
      if (filled && y > entry.y) {
        end.y = y
      }
    }

    // fill minimum size
    const _size = () => ({
      width: (end.x - start.x + 1),
      height: (end.y - start.y + 1),
    })
    while (_size().width < MIN_MAP_SIZE) {
      if (end.x < MAX_MAP_SIZE - 1) {
        end.x++
      } else {
        start.x--
      }
    }
    while (_size().height < MIN_MAP_SIZE) {
      if (end.y < MAX_MAP_SIZE - 1) {
        end.y++
      } else {
        start.y--
      }
    }

    const bounds = {
      start,
      end,
      size: _size(),
    }
    this.localStore.setDocument('mapBounds', id, bounds)
  }

  init2D = (id) => {
    const gravityMap = this.localStore.getDocument('editGravityMap', id) ?? false

    this.calculateMapBounds(id)

    const mapBounds = this.localStore.getDocument('mapBounds', id) ?? {}

    // canvas size in pixels
    const canvasWidth = process.env.RENDER_WIDTH
    const canvasHeight = process.env.RENDER_HEIGHT

    // map size in tiles
    const mapWidth = gravityMap ? MAX_MAP_SIZE : Math.max(mapBounds.size.width, DEFAULT_MAP_WIDTH)
    const mapHeight = gravityMap ? MAX_MAP_SIZE : Math.max(mapBounds.size.height, DEFAULT_MAP_HEIGHT)

    // tile size inside canvas, in pixels
    const scale = Math.min(canvasWidth / mapWidth, canvasHeight / mapHeight)

    // viewport 'camera' offset
    const offset = {
      x: -(gravityMap ? 0 : mapBounds.start.x) + (canvasWidth / scale) / 2,
      y: -(gravityMap ? 0 : mapBounds.start.y) + (canvasHeight / scale) / 2,
    }

    // map start, used to draw tiles in map space
    const start = {
      x: -(gravityMap ? MAX_MAP_SIZE : mapBounds.size.width) / 2,
      y: -(gravityMap ? MAX_MAP_SIZE : mapBounds.size.height) / 2,
    }

    this.viewport = {
      offset,
      scale,
      start,
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

    // hide everything under map
    const groundMaterial = new THREE.MeshBasicMaterial({
      color: 0x000,
    })
    const groundGeometry = new THREE.PlaneGeometry(MAX_MAP_SIZE, MAX_MAP_SIZE, 1, 1)
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial)
    groundMesh.position.set(MAX_MAP_SIZE / 2, -MAX_MAP_SIZE / 2, -1)
    scene.add(groundMesh)

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

    let map3D = new Array(MAX_MAP_SIZE)
    for (let x = 0; x < MAX_MAP_SIZE; x++) {
      map3D[x] = new Array(MAX_MAP_SIZE)
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

    for (let x = 0; x < MAX_MAP_SIZE; x++) {
      for (let y = 0; y < MAX_MAP_SIZE; y++) {
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
          y: y * cellWidth - MAX_MAP_SIZE * cellWidth - cellWidth * 0.5,
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

    const tileset = this.remoteStore.getDocument('tileset', id)
    this.swapTileset(id, tileset)

  }

  resetMap(id) {
    let map = []

    const start = {
      x: Math.floor(MAX_MAP_SIZE * 0.25),
      y: Math.floor(MAX_MAP_SIZE * 0.25),
    }
    const end = {
      x: Math.floor(MAX_MAP_SIZE * 0.75),
      y: Math.floor(MAX_MAP_SIZE * 0.75),
    }
    const entry = {
      x: Math.floor(MAX_MAP_SIZE * 0.5),
      y: Math.floor(MAX_MAP_SIZE * 0.5),
    }

    for (let y = 0; y < MAX_MAP_SIZE; y++) {
      let row = new Array(MAX_MAP_SIZE).fill(null)
      for (let x = 0; x < MAX_MAP_SIZE; x++) {
        row[x] = (x >= start.x && x <= end.x && y >= start.y && y <= end.y) ? DEFAULT_MAP_TILE : null
      }
      map.push(row)
    }

    this.remoteStore.setDocument('map', id, map)

    const settings = this.Settings.get(id)
    this.remoteStore.setDocument('settings', 'world', {
      ...settings,
      entry,
    })
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
    if (!map) return 

    if (!this.validateTile(x, y)) {
      return // invalid tile
    }

    if (map[y][x] === value) {
      return // no change
    }

    if (value == null) {
      const settings = this.Settings.get(id)
      if (x == settings.entry.x && y == settings.entry.y) {
        return // cannot delete entry
      }
    } else if (typeof value != 'number' || value < 0 || value > 9) {
      return // invalid value
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
    // context.clearRect(0, 0, canvas.width, canvas.height)
    // context.rect(0, 0, canvas.width, canvas.height)
    // context.fillStyle = 'black'
    // context.fill()

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
      context.drawImage(gravityImage, 0, 0, MAX_MAP_SIZE, MAX_MAP_SIZE)

      const gridImage = getTextureImageByName('gridtile')
      for (let x = 0; x < MAX_MAP_SIZE; x++) {
        for (let y = 0; y < MAX_MAP_SIZE; y++) {
          context.drawImage(gridImage, x, y, 1, 1)
        }
      }
    }

    const mapBounds = this.localStore.getDocument('mapBounds', 'world')
    this.drawRect(context, mapBounds.start.x, mapBounds.start.y, mapBounds.size.width, mapBounds.size.height, 0.05, gravityMap ? 'red' : '#fff1')

    const bounds = this.getCurrentBounds()

    Map.draw2dMap(id, context, this.remoteStore, bounds)

    const settings = this.remoteStore.getDocument('settings', id)
    const { entry } = settings
    this.drawTextureAtTile(context, entry.x, entry.y, 'entry')
  }

  static draw2dMap(id, context, store, bounds = null) {
    const map = store.getDocument('map', id)
    if(!map) return

    const crdtTileset = store.getDocument('tileset', id)

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

    const start = bounds?.start ?? defaultBounds.start
    const end = bounds?.end ?? defaultBounds.end

    for (let y = start.y; y <= end.y; y++) {
      for (let x = start.x; x <= end.x; x++) {
        let tileIndex = map[y]?.[x] ?? null
        if (tileIndex == null || tileIndex < 0 || tileIndex > 9) continue

        context.drawImage(
          image,
          tileIndex * imageTileSize,
          0,
          imageTileSize,
          imageTileSize,
          x,
          y,
          1,
          1,
        )
      }
    }
  }

  drawTextureAtTile(context, x, y, textureName, altTextureName = null) {
    if (!this.viewport) return // not initialized

    if (!this.validateTile(x, y)) return

    const texture = getTextureImageByName(textureName, altTextureName)
    if (texture == null) {
      console.warn(`Map.drawTextureAtTile(${textureName}, ${altTextureName}) not found`)
      return
    }

    context.drawImage(
      texture,
      x,
      y,
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

  getCurrentBounds() {
    const gravityMap = this.localStore.getDocument('editGravityMap', 'world') ?? false
    const mapBounds = this.localStore.getDocument('mapBounds', 'world')
    
    if (gravityMap || !mapBounds) {
      return defaultBounds
    }

    return mapBounds
  }

  validateTile(x, y) {
    if (!this.viewport) return false // not initialized
    const bounds = this.getCurrentBounds()
    return (x != null && x >= bounds.start.x && x <= bounds.end.x && y != null && y >= bounds.start.y && y <= bounds.end.y)
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

    if (!this.validateTile(tile.x, tile.y)) {
      return null
    }

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

    for (let x = 0; x < MAX_MAP_SIZE; x++) {
      for (let y = 0; y < MAX_MAP_SIZE; y++) {
        let mapCell = map3D[MAX_MAP_SIZE - 1 - y][x]

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
    const materialUV = this.localStore.getDocument('material-uv', id)
    if (materialUV === null) return

    const loader = new THREE.TextureLoader()

    materialUV.map = loader.load(tileset?.blob ?? tileset?.name ?? defaultTileset.src)
    materialUV.map.magFilter = THREE.NearestFilter
    materialUV.map.minFilter = THREE.NearestFilter

    materialUV.needsUpdate = true
  }

}

export default Map
