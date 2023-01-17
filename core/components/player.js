import * as THREE from 'three'
import * as Room from '../networking'
import * as Portal from './portal'
import * as Book from './book'
import { getActionState } from '../controller'
import { getTextureByName } from '../textures'
import { getRemoteStore, getLocalStore } from '../singleton'
import { CONST, clamp, clampRadians, deepCompare, deepCopy } from '../utils'
import { floors, getTile } from './map'
import { strokeCircle, strokeRect } from '../debug-render'
import { getOverlappingTiles, rectanglesOverlap } from '../collisions'

const SPEED = 125
const PLAYER_BOX = 16
const PLAYER_RADIUS = 8
const PLAYER_MESH = 2
const Z_OFFSET = 0.89
const CAM_Z_OFFSET = 1.5
const GRAVITY = 25
const MAX_Z_SPEED = 100
const JUMP_SPEED = 7.5
let zSpeed = 0
let grounded = false

export const init = () => {
  // Listen to remote players events
  // managed by client-room, keeping just as an example
  const room = Room.get()
  const remoteStore = getRemoteStore()

  const geometry = new THREE.PlaneGeometry(PLAYER_MESH, PLAYER_MESH);
  const textureName = getTextureByName('player').src;
  const texture = new THREE.TextureLoader().load(textureName);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  });

  room.on('agent-join', (agentId) => {
    if (agentId === room.agentId) {
      return
    }

    const localStore = getLocalStore()
    const scene = localStore.getDocument('scene', 'scene')
    if (scene === null) {
      return
    }

    const playerMesh = new THREE.Mesh(geometry, material);
    scene.add(playerMesh);

    localStore.setDocument('player-mesh', agentId, playerMesh)
    // console.log(`ADDED Player`, agentId)
  })
  room.on('agent-leave', (agentId) => {
    const localStore = getLocalStore()
    const scene = localStore.getDocument('scene', 'scene')
    const playerMesh = localStore.getDocument('player-mesh', agentId)

    if (scene !== null && playerMesh !== null) {
      scene.remove(playerMesh)
      // console.log(`REMOVED Player`, agentId)
    }

    localStore.setDocument('player-mesh', agentId, null)
  })
  remoteStore.on({ type: 'player', event: 'update' }, (id, player) => {
  })
}

export const update3d = (id) => {
  const room = Room.get()
  if (id === room.agentId) {
    return;
  }

  const localStore = getLocalStore()
  const playerMesh = localStore.getDocument('player-mesh', id)
  if (playerMesh === null) {
    return;
  }

  const remoteStore = getRemoteStore()
  const player = remoteStore.getDocument('player', id)
  if (player === null) {
    return
  }

  // Position
  const { position: { x, y, z }, rotation } = player  
  playerMesh.position.set(
    x / 32,
    - y / 32,
    z + PLAYER_MESH / 2,
  )

  // Rotation (biillboard) 
  const thisPlayer = remoteStore.getDocument('player', room.agentId)
  const rotToThisPlayer = Math.atan2(y - thisPlayer.position.y, x - thisPlayer.position.x) - CONST.HALF_PI;
  playerMesh.rotation.set(
    CONST.HALF_PI,
    -rotToThisPlayer,
    0
  )

  // UV
  const texture = getTextureByName('player')
  const rot = -(player.rotation.y + rotToThisPlayer + CONST.PI);
  const { uv } = getSpriteUV(texture, x, y, rot);
  
  var geometryUv = playerMesh.geometry.getAttribute('uv');

  // 2 3
  // 0 1
  geometryUv.setXY(0, uv.start[0], uv.start[1]);
  geometryUv.setXY(1, uv.end[0], uv.start[1]);
  geometryUv.setXY(2, uv.start[0], uv.end[1]);
  geometryUv.setXY(3, uv.end[0], uv.end[1]);
  geometryUv.needsUpdate = true;

  playerMesh.geometry.setAttribute('uv', geometryUv);

  // Scale
  playerMesh.scale.set(
    texture.width / texture.height,
    1.0,
    1
  )

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
    radius: PLAYER_RADIUS,
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
    x: Math.round(x - PLAYER_RADIUS),
    y: Math.round(y - PLAYER_RADIUS),
  },
  size: {
    width: PLAYER_BOX,
    height: PLAYER_BOX,
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

  if (show3D) {
    const angle = new THREE.Euler(CONST.HALF_PI, rotation.y, rotation.z)

    const forward = new THREE.Vector3(0, 0, 1)
    const right = new THREE.Vector3(1, 0, 0)

    forward.applyEuler(angle)
    right.applyEuler(angle)

    const forwardMove = new THREE.Vector3(0, 0, 0)
    const sideMove = new THREE.Vector3(0, 0, 0)

    forwardMove.add(forward.setLength(SPEED * dt))
    sideMove.add(right.setLength(SPEED * dt))

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
      rotationCopy.x -= Math.PI * dt * 0.75
      if (rotationCopy.x < -Math.PI * 0.25) {
        rotationCopy.x = -Math.PI * 0.25
      }
    }
    if (getActionState('moveForward')) {
      rotationCopy.x += Math.PI * dt * 0.75
      if (rotationCopy.x > +Math.PI * 0.15) {
        rotationCopy.x = +Math.PI * 0.15
      }
    }

  } else {
    let speedX = 0;
    let speedY = 0;

    if (getActionState('left') || getActionState('turnLeft')) {
      speedX -= SPEED;
    }
    if (getActionState('right') || getActionState('turnRight')) {
      speedX += SPEED;
    }
    if (getActionState('up')) {
      speedY -= SPEED;
    }
    if (getActionState('down')) {
      speedY += SPEED;
    }

    if (speedX || speedY) {
      x += speedX * dt
      y += speedY * dt
      if (speedY) {
        rotationCopy.y = CONST.HALF_PI + (CONST.HALF_PI * Math.sign(speedY))
      } else if (speedX) {
        rotationCopy.y = Math.PI + (CONST.HALF_PI * Math.sign(speedX))
      }
    }
  }

  x = clamp(x, PLAYER_RADIUS, 640 - PLAYER_RADIUS)
  y = clamp(y, PLAYER_RADIUS, 480 - PLAYER_RADIUS)

  const overlappingTiles = getOverlappingTiles(fromPosToRect(x, player.position.y), 32)
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
  }

  if (player.position.x !== x || player.position.y !== y || player.position.z !== z || deepCompare(rotation, rotationCopy) === false) {
    
    rotationCopy.y = clampRadians(rotationCopy.y);

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
      CONST.HALF_PI,
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

export const render2d = (id, context) => {
  const store = getRemoteStore()
  const player = store.getDocument('player', id)

  if (player === null) {
    return
  }
  // console.log(`render player:`, id)

  const { position: { x, y }, rotation } = player

  const texture = getTextureByName('player')

  strokeCircle(context, getCollisionCircle(id))
  strokeRect(context, getCollisionRect(id))

  let sWidth = texture.width;
  let sHeight = texture.height;
  let sx = 0;
  let sy = 0;

  if (texture.sprites) {
    sWidth = texture.sprites.width;
    sHeight = texture.sprites.height;

    const { coord } = getSpriteUV(texture, x, y, rotation.y);

    sx = coord[0] * sWidth;
    sy = coord[1] * sHeight;
  }

  const dWidth = sWidth * texture.scale;
  const dHeight = sHeight * texture.scale;
  const dx = Math.round(x - (dWidth / 2));
  const dy = Math.round(y - dHeight + PLAYER_RADIUS);

  context.drawImage(
    texture.image,
    sx, sy,
    sWidth, sHeight,
    dx, dy,
    dWidth, dHeight,
  )

}

const getSpriteUV = (texture, x, y, rot) => {
  let step;
  let cycleName;

  rot = clampRadians(rot);

  if (Math.abs(rot - CONST.HALF_PI) <= CONST.QUATER_PI) {
    cycleName = 'walkLeft';
    step = (x % 32) / 32;
  } else if (Math.abs(rot - (CONST.HALF_PI + Math.PI)) <= CONST.QUATER_PI) {
    cycleName = 'walkRight';
    step = (x % 32) / 32;
  } else if (Math.abs(rot - Math.PI) <= CONST.QUATER_PI) {
    cycleName = 'walkDown';
    step = (y % 32) / 32;
  } else {
    cycleName = 'walkUp';
    step = (y % 32) / 32;
  }

  const cycle = texture.sprites.cycles?.[cycleName] ?? texture.sprites.cycles?.idle ?? null;
  step = Math.floor(step * (cycle?.length ?? 1));

  const coord = cycle?.[step] ?? [0, 0];

  const dx = 1.0 / texture.sprites.columns;
  const dy = 1.0 / texture.sprites.rows;

  const uv = {
    start: [coord[0] * dx, 1.0 - coord[1] * dy],
    end: [(coord[0] + 1) * dx, 1.0 - (coord[1] + 1) * dy],
  }

  return {
    cycleName,
    coord,
    uv,
  }
}