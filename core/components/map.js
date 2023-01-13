import * as THREE from 'three'
import { getTextureByName } from '../textures'
import { getRemoteStore, getLocalStore } from '../singleton'
import { getMultiple } from '../utils'
import { getActionState } from 'core/controller'
import { defaultTileset } from '../texture-data'

export const MAP_WIDTH = 20
export const MAP_HEIGHT = 15

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

export const init = () => {
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
    map: loader.load(defaultTileset),
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
      0.1*index, 1,
      0.1*index + 0.1, 1,
      0.1*index, 0,
      0.1*index + 0.1, 0
    ])

    plane.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  }

  for(let i = 0; i < floorGeometries.length; i++){
    setUV(floorGeometries[i], i)
    setUV(wallGeometries[i], i)
  }

  const gridContainer = new THREE.Object3D()

  let map3D = new Array(MAP_WIDTH)
  for (let x = 0; x < MAP_WIDTH; x++) {
    map3D[x] = new Array(MAP_HEIGHT)
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
    
    wall3Dn.position.y = cellWidth/2
    wall3Ds.position.y = -cellWidth/2

    wall3De.position.x = -cellWidth/2
    wall3Dw.position.x = cellWidth/2

    wall3Dn.rotateX(Math.PI/2)
    wall3Dn.rotateY(Math.PI)

    wall3Ds.rotateX(Math.PI/2)
    wall3Ds.rotateY(0)

    wall3De.rotateX(Math.PI/2)
    wall3De.rotateY(-Math.PI/2)

    wall3Dw.rotateX(Math.PI/2)
    wall3Dw.rotateY(Math.PI/2)

    object3D.add(wall3De)
    object3D.add(wall3Dw)
    object3D.add(wall3Dn)
    object3D.add(wall3Ds)
  }

  for (let x = 0; x < MAP_WIDTH; x++) {
    for (let y = 0; y < MAP_HEIGHT; y++) {
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
      let pos = fromTileToPosition(x,y)

      gridCell3D.position.x = pos.x
      gridCell3D.position.y = pos.y + cellWidth

      gridContainer.add(gridCell3D)
    }
  }

  const localStore = getLocalStore()

  const scene = localStore.getDocument('scene', 'scene')
  scene.add(gridContainer)

  localStore.setDocument('map3d', 'world', map3D)
  localStore.setDocument('floor-geometries', 'world', floorGeometries)
  localStore.setDocument('wall-geometries', 'world', wallGeometries)
  localStore.setDocument('material-uv', 'world', materialUV)
  localStore.setDocument('gridContainer', 'gridContainer', gridContainer)

  // texture swapping
  const remoteStore = getRemoteStore()
  remoteStore.on({ type: 'tileset', event: 'change' }, (id, tileset) => {
    if (id === 'world') {
      swapTileset(id, tileset)
    }
  })
}

export const create = (id) => {
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

  const store = getRemoteStore()

  store.setDocument('map', id, map)

  return map
}

export const exists = (id) => {
  const store = getRemoteStore()
  return store.hasDocument('map', id)
}

export const update = (id, x, y, value) => {
  const store = getRemoteStore()
  const map = store.getDocument('map', id)

  if (map === null) {
    return
  }

  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) {
    return
  }

  if (map[y][x] === value) {
    return
  }

  store.setValueAtPath('map', id, `/${y}.${x}`, value)
}

export const render = (id, context) => {
  const store = getRemoteStore()
  const map = store.getDocument('map', id)

  if (map === null) {
    return
  }

  const crdtTileset = store.getDocument('tileset', id)

  let image
  if (crdtTileset === null) {
    image = getTextureByName('tileset')
  } else {
    image = new Image()
    image.src = crdtTileset.blob ?? crdtTileset.name
  }

  for (let x = 0; x < MAP_WIDTH; x++) {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      context.drawImage(
        image,
        map[y][x] * 32,
        0,
        32,
        32,
        x * 32,
        y * 32,
        32,
        32,
      )
    }
  }
}

export const fromTileToPosition = (tileX, tileY) => {
  const x = tileX * cellWidth + cellWidth * 0.5
  const y = tileY * cellWidth -MAP_HEIGHT * cellWidth - cellWidth * 0.5

  return {
    x: x,
    y: y
  }
}

export const getTileAtPosition = (id, x, y) => {
  const store = getRemoteStore()
  const map = store.getDocument('map', id)

  if (map === null) {
    return null
  }

  const tileX = getMultiple(x, 32)
  const tileY = getMultiple(y, 32)

  if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT) {
    return null
  }

  return map[tileY][tileX]
}

export const getTile = (id, x, y) => {
  const store = getRemoteStore()
  const map = store.getDocument('map', id)

  if (map === null) {
    return null
  }

  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) {
    return null
  }

  return map[y][x]
}

export const render3D = (id) => {
  const remoteStore = getRemoteStore()
  const localStore = getLocalStore()

  const map = remoteStore.getDocument('map', id)

  if (map === null) {
    return
  }

  const map3D = localStore.getDocument('map3d', 'world')

  if (map3D === null) {
    return
  }

  const floorGeometries = localStore.getDocument('floor-geometries', 'world')

  if (floorGeometries === null) {
    return
  }

  const wallGeometries = localStore.getDocument('wall-geometries', 'world')

  if (wallGeometries === null) {
    return
  }

  for (let x = 0; x < MAP_WIDTH; x++) {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      let mapCell = map3D[MAP_HEIGHT-1-y][x]

      mapCell.mesh.geometry = floorGeometries[map[y][x]]

      mapCell.mesh.position.z = walls[map[y][x]]

      const updateGeometries = (wallStack) => {
        wallStack.children.forEach(element => {
          element.geometry = wallGeometries[map[y][x]]
        })
      }
      updateGeometries(mapCell.walls.stack1)
      updateGeometries(mapCell.walls.stack2)
      updateGeometries(mapCell.walls.stack3)
    }
  }
}

export const swapTileset = (id, tileset) => {
  if (id !== 'world') {
    return
  }

  const localStore = getLocalStore()

  const materialUV = localStore.getDocument('material-uv', id)

  if (materialUV === null) {
    return
  }

  const loader = new THREE.TextureLoader()

  materialUV.map = loader.load(tileset?.blob ?? tileset?.name ?? defaultTileset)
  materialUV.map.magFilter = THREE.NearestFilter
  materialUV.map.minFilter = THREE.NearestFilter

  materialUV.needsUpdate = true
}
