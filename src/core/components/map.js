import * as THREE from 'three'
import RoomCollection from '@/core/interfaces/RoomCollection'
import { getTextureImageByName } from '@/core/textures'
import { defaultTileset } from '@/core/texture-data'
import { clamp } from '@/core/utils'
import { defaultSettings } from '@/core/components/settings'

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

    const settings = this.remoteStore.getDocument('settings', 'world') ?? defaultSettings

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
        let pos = this.fromTileToCellPosition(x, y)

        gridCell3D.position.x = pos.x
        gridCell3D.position.y = pos.y + cellWidth

        gridContainer.add(gridCell3D)
      }
    }

    const scene = this.localStore.getDocument('scene', 'scene')
    scene.add(gridContainer)

    this.localStore.setDocument('map3d', 'world', map3D)
    this.localStore.setDocument('floor-geometries', 'world', floorGeometries)
    this.localStore.setDocument('wall-geometries', 'world', wallGeometries)
    this.localStore.setDocument('material-uv', 'world', materialUV)
    this.localStore.setDocument('gridContainer', 'gridContainer', gridContainer)

    // texture swapping
    this.remoteStore.on({ type: 'tileset', event: 'change' }, (id, tileset) => {
      if (id === 'world') {
        this.swapTileset(id, tileset)
      }
    })
  }

  initializeMap(id) {
    if (this.exists(id)) return

    const map = [
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

    this.upsert(id, map)
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

  getMapScale(id) {
    const settings = this.remoteStore.getDocument('settings', id) ?? defaultSettings
    return {
      x: (process.env.CANVAS_WIDTH / (settings.size.width * 32)),
      y: (process.env.CANVAS_HEIGHT / (settings.size.height * 32)),
    }
  }

  render2d(id, context, store) {
    const map = store.getDocument('map', id)

    if (map === null) {
      console.log(`Map.render2d() Map is null`, id)
      return
    }

    const mapScale = this.getMapScale('world')

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(mapScale.x, mapScale.y);

    const crdtTileset = store.getDocument('tileset', id)

    let image
    let sz

    if (crdtTileset?.blob) {
      image = new Image()
      image.src = crdtTileset.blob
      sz = crdtTileset.size.height ?? 32
    } else {
      image = getTextureImageByName(crdtTileset?.name ?? 'tileset')
      sz = image?.height ?? 32
    }

    const settings = store.getDocument('settings', 'world') ?? defaultSettings

    // console.log(`render`, crdtTileset, image, sz, settings)

    for (let x = 0; x < settings.size.width; x++) {
      for (let y = 0; y < settings.size.height; y++) {
        const tile = clamp(map[y][x], 0, 9)
        context.drawImage(
          image,
          tile * sz,
          0,
          sz,
          sz,
          x * 32,
          y * 32,
          32,
          32,
        )
      }
    }
  }

  getTile(id, x, y){
    const map = this.remoteStore.getDocument('map', id)

    if (map === null) {
      return null
    }

    if (!this.validateTile(x, y)) {
      return null
    }

    const tile = map[y][x]

    return clamp(tile, 0, 9)
  }

  getTileAtCanvasPosition(id, x, y) {
    const tileX = x / 32
    const tileY = y / 32
    return this.getTile(tileX, tileY);
  }

  validateTile(x, y) {
    const settings = this.remoteStore.getDocument('settings', 'world') ?? defaultSettings
    if (x == null || x < 0 || x >= settings.size.width || y == null || y < 0 || y >= settings.size.height) {
      return false
    }
    return true
  }

  fromTileToCanvasPosition(tileX, tileY) {
    if (!this.validateTile(tileX, tileY)) {
      const settings = this.remoteStore.getDocument('settings', 'world') ?? defaultSettings
      tileX = settings.entry.x
      tileY = settings.entry.y
    }
    const x = Math.floor((tileX + 0.5) * 32)
    const y = Math.floor((tileY + 0.5) * 32)
    return { x, y }
  }

  fromTileToCellPosition(tileX, tileY) {
    const settings = this.remoteStore.getDocument('settings', 'world') ?? defaultSettings

    const x = tileX * cellWidth + cellWidth * 0.5
    const y = tileY * cellWidth - settings.size.height * cellWidth - cellWidth * 0.5
    return { x, y }
  }

  render3D(id) {
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

    const settings = this.remoteStore.getDocument('settings', 'world') ?? defaultSettings

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
