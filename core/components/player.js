import * as THREE from 'three'
import * as Room from '../networking'
import * as Portal from './portal'
import * as Book from './book'
import { getActionState } from '../controller'
import { getTextureByName } from '../textures'
import { getRemoteStore, getLocalStore } from '../singleton'
import { clamp, deepCompare, deepCopy } from '../utils'
import { floors, getTile } from './map'
import { strokeCircle, strokeRect } from '../debug-render'
import { getOverlappingTiles, rectanglesOverlap } from '../collisions'

const SPEED = 125
const PLAYER_WIDTH = 14
const PLAYER_HEIGHT = 50
const Z_OFFSET = 1.2
const CAM_Z_OFFSET = 1.5
const GRAVITY = 25
const MAX_Z_SPEED = 100
const JUMP_SPEED = 7.5
let zSpeed = 0
let grounded = false

const image = new THREE.TextureLoader().load('james.png')
const material = new THREE.SpriteMaterial({ map: image })
material.map.minFilter = THREE.NearestFilter
material.map.magFilter = THREE.NearestFilter

export const init = () => {
  const room = Room.get()
  const localStore = getLocalStore()
  const remoteStore = getRemoteStore()

  const scene = localStore.getDocument('scene', 'scene')

  if (scene === null) {
    return
  }

  const selectionGeometry = new THREE.BoxGeometry(1.2, 1.2, 2.3)

  const selectionMat = new THREE.MeshBasicMaterial({ color: 0xFF0000, transparent: true, opacity: 0.23 })

  room.on('agent-join', (agentId) => {
    let player = remoteStore.getDocument('player', agentId)

    if (player === null) {
      player = {
        position: {
          x: 0,
          y: 0,
          z: 0,
        },
      }
    }

    const playerSprite = new THREE.Sprite(material)
    const selectionMesh = new THREE.Mesh(selectionGeometry, selectionMat)
    selectionMesh.visible = false

    playerSprite.scale.set(1,1,1)

    playerSprite.position.set(
      player.position.x / 32,
      -player.position.y / 32,
      Z_OFFSET + player.position.z,
    )

    scene.add(playerSprite)
    scene.add(selectionMesh)

    localStore.setDocument('player-sprite', agentId, playerSprite)
    localStore.setDocument('selection-mesh', agentId, selectionMesh)
  })

  room.on('agent-leave', (agentId) => {
    const playerSprite = localStore.getDocument('player-sprite', agentId)
    const selectionMesh = localStore.setDocument('selection-mesh', agentId)

    if (playerSprite === null || selectionMesh === null) {
      return
    }
    scene.remove(playerSprite)
    scene.remove(selectionMesh)

    localStore.setDocument('player-sprite', agentId, null)
  })

  remoteStore.on({ type: 'player', event: 'update' }, (id, player) => {
    // Update the sprite location to be the position of the player.
    const playerSprite = localStore.getDocument('player-sprite', id)

    if (playerSprite === null) {
      return
    }

    playerSprite.position.set(
      player.position.x / 32,
      -player.position.y / 32,
      Z_OFFSET + player.position.z,
    )
  })
}

export const create = (id, x, y, z = 0) => {
  const player = {
    position: {
      x,
      y,
      z,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
    }
  }

  const store = getRemoteStore()
  store.setDocument('player', id, player)

  return player
}

// We should add a delete portal button too.
export const interact = (id) => {
  const store = getRemoteStore()
  const localStore = getLocalStore()
  const player = store.getDocument('player', id)

  if (player === null) {
    return
  }

  const portalIds = store.getIds('portal')
  for (const portalId of portalIds) {
    // This should also take into account the height of the thing, currently if you're in the air
    // not touching a portal you can still use it for travel.
    if (rectanglesOverlap(getCollisionRect(id), Portal.getCollisionRect(portalId))) {
      Portal.travel(portalId)
    }
  }

  const bookIds = store.getIds('book')
  for (const bookId of bookIds) {
    if (rectanglesOverlap(getCollisionRect(id), Book.getCollisionRect(bookId))) {
      Book.read(bookId)
      localStore.setDocument('documentId', 'world', bookId)

      localStore.setDocument('show-doc', 'world', true)
      break
    }
  }

  // Check if you're standing where the document is
  if (player.position.y / 32 >= 2 && player.position.y / 32 <= 3 && player.position.x / 32 >= 8.5 && player.position.x / 32 <= 11.5) {
    localStore.setDocument('show-doc', 'world', true)
  }
}

export const exists = (id) => {
  const store = getRemoteStore()
  const player = store.getDocument('player', id)

  return player !== null
}

export const getCollisionCircle = (id) => {
  const store = getRemoteStore()
  const player = store.getDocument('player', id)
  if (player === null) {
    return null
  }

  const { x, y } = player.position

  return {
    position: {
      x: Math.round(x),
      y: Math.round(y),
    },
    radius: PLAYER_WIDTH * 0.5,
  }
}

export const getCollisionRect = (id) => {
  const store = getRemoteStore()

  const player = store.getDocument('player', id)
  if (player === null) {
    return null
  }

  const { x, y } = player.position

  return fromPosToRect(x, y)
}

export const fromPosToRect = (x, y) => ({
  position: {
    x: Math.round(x - PLAYER_WIDTH * 0.5),
    y: Math.round(y - PLAYER_WIDTH + 7),
  },
  size: {
    width: PLAYER_WIDTH,
    height: PLAYER_WIDTH,
  },
})

export const update = (id, dt) => {
  const localStore = getLocalStore()
  const store = getRemoteStore()
  const player = store.getDocument('player', id)
  if (player === null) {
    return
  }

  let { position: { x, y, z }, rotation } = player
  const rotationCopy = deepCopy(rotation)

  const show3D = localStore.getDocument('show-3d', 'world')

  if(show3D){    
    const angle = new THREE.Euler(Math.PI/2,rotation.y,rotation.z)
    
    const forward = new THREE.Vector3(0,0,1)
    const right = new THREE.Vector3(1,0,0)

    forward.applyEuler(angle)
    right.applyEuler(angle)

    const forwardMove = new THREE.Vector3(0,0,0)
    const sideMove = new THREE.Vector3(0,0,0)

    forwardMove.add(forward.setLength(SPEED*dt))
    sideMove.add(right.setLength(SPEED*dt))

    if (getActionState('left')) {
      x -= sideMove.x
      y += sideMove.y
    }
  
    if (getActionState('right')) {
      x += sideMove.x
      y -= sideMove.y
    }
  
    if (getActionState('up')) {
      x -= forwardMove.x
      y += forwardMove.y
    }
  
    if (getActionState('down')) {
      x += forwardMove.x
      y -= forwardMove.y
    }
  
    if (getActionState('turnLeft')) {
      rotationCopy.y += Math.PI * dt
    }
    if (getActionState('turnRight')) {
      rotationCopy.y -= Math.PI * dt
    }
    if (getActionState('moveBack')) {
      rotationCopy.x -= Math.PI * dt *0.75
      if(rotationCopy.x < -Math.PI*0.25){
        rotationCopy.x = -Math.PI*0.25
      }
    }
    if (getActionState('moveForward')) {
      rotationCopy.x += Math.PI * dt *0.75
      if(rotationCopy.x > +Math.PI*0.15){
        rotationCopy.x = +Math.PI*0.15
      }
    }

  } else {
    if (getActionState('left')) {
      x -= SPEED * dt
    }
  
    if (getActionState('right')) {
      x += SPEED * dt
    }
  
    if (getActionState('up')) {
      y -= SPEED * dt
    }
  
    if (getActionState('down')) {
      y += SPEED * dt
    }
  }

  x = clamp(x, 0, 640)
  y = clamp(y, 0, 480)

  /*const overlappingTiles = getOverlappingTiles(fromPosToRect(x, player.position.y), 32)
  for (let i = 0; i < overlappingTiles.length; i++) {
    const tile = getTile('world', overlappingTiles[i].x, overlappingTiles[i].y)

    if (tile !== null) {
      const currentFloorHeight = floors[tile]

      if (z < currentFloorHeight - 0.75) {
        x = player.position.x
        // y = player.position.y

        break
      }
    }
  }

  const overlappingTiles3 = getOverlappingTiles(fromPosToRect(player.position.x, y), 32)
  for (let i = 0; i < overlappingTiles3.length; i++) {
    const tile = getTile('world', overlappingTiles3[i].x, overlappingTiles3[i].y)

    if (tile !== null) {
      const currentFloorHeight = floors[tile]

      if (z < currentFloorHeight - 0.75) {
        // x = player.position.x
        y = player.position.y

        break
      }
    }
  }

  // const tile = getTileAtPosition('world', x, y)

  zSpeed += GRAVITY * dt
  zSpeed = Math.min(zSpeed, MAX_Z_SPEED)

  if (getActionState('jump') && grounded) {
    zSpeed = -JUMP_SPEED
    grounded = false
  }

  z -= zSpeed * dt

  // const floorHeight = tile === null ? 0 : floors[tile]

  // if (z < floorHeight) {
  //   z = floorHeight
  //   zSpeed = 0
  //   grounded = true
  // }

  const overlappingTiles2 = getOverlappingTiles(fromPosToRect(x, y), 32)
  for (let i = 0; i < overlappingTiles2.length; i++) {
    const tile = getTile('world', overlappingTiles2[i].x, overlappingTiles2[i].y)

    if (tile !== null) {
      const currentFloorHeight = floors[tile]

      if (z < currentFloorHeight) {
        z = currentFloorHeight
        zSpeed = 0
        grounded = true
      }
    }
  }*/

  if (player.position.x !== x || player.position.y !== y || player.position.z !== z || deepCompare(rotation, rotationCopy) === false) {
    store.setDocument('player', id, {
      position: {
        x,
        y,
        z,
      },
      rotation: rotationCopy,
    })
  }
  
  const cameraOrbit = localStore.getDocument('cameraOrbit', 'cameraOrbit')
  const camera = localStore.getDocument('camera', 'camera')

  if (cameraOrbit === null) {
    return
  }

  if (cameraOrbit !== null) {
    cameraOrbit.position.set(
      x / 32,
      - y / 32,
      CAM_Z_OFFSET + z,
    )

    cameraOrbit.rotation.set(
      Math.PI/2, 
      rotation.y, 
      rotation.z
    )

    camera.rotation.set(
      rotation.x, 
      0, 
      0
    )
  }
}

export const render = (id, context) => {
  const store = getRemoteStore()
  const player = store.getDocument('player', id)

  if (player === null) {
    return
  }

  const { position: { x, y } } = player

  const playerTexture = getTextureByName('player')

  /*context.drawImage(
    playerTexture,
    Math.round(x - PLAYER_WIDTH * 0.5),
    Math.round(y - PLAYER_HEIGHT + 5),
    PLAYER_WIDTH,
    PLAYER_HEIGHT,
  )*/

  context.drawImage(
    playerTexture,
    Math.round(x - 32 * 0.5),
    Math.round(y - 32 + 5),
    32,
    32,
  )

  strokeRect(context, getCollisionRect(id))
  strokeCircle(context, getCollisionCircle(id))
}
