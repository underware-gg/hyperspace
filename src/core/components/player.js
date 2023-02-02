import * as THREE from 'three'
import * as Room from '@/core/networking'
import * as Portal from '@/core/components/portal'
import * as Screen from '@/core/components/screen'
import * as Book from '@/core/components/book'
import * as Interactable from '@/core/components/interactable'
import { getActionState, addActionDownListener } from '@/core/controller'
import { getTextureByName, getSprite } from '@/core/textures'
import { getRemoteStore, getLocalStore } from '@/core/singleton'
import { CONST, clamp, clampRadians, deepCompare, deepCopy } from '@/core/utils'
import { floors, getTile } from '@/core/components/map'
import { strokeCircle, strokeRect } from '@/core/rendering/debug-render'
import { getOverlappingTiles, rectanglesOverlap } from '@/core/collisions'

const SPEED = 125
const PLAYER_BOX = 16
const PLAYER_RADIUS = 8
const PLAYER_MESH = 1.4
const CAM_Z_OFFSET = 1.15
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

  room.on('agent-join', (agentId) => {
    if (agentId === room.agentId) {
      return
    }

    const localStore = getLocalStore()
    const scene = localStore.getDocument('scene', 'scene')
    if (scene === null) {
      return
    }

    const material = makePlayerMaterial(agentId)
    const playerMesh = new THREE.Mesh(geometry, material);
    scene.add(playerMesh);

    localStore.setDocument('player-mesh', agentId, playerMesh)
    console.log(`agent-join:`, agentId)
  })

  room.on('agent-leave', (agentId) => {
    const localStore = getLocalStore()
    const scene = localStore.getDocument('scene', 'scene')
    const playerMesh = localStore.getDocument('player-mesh', agentId)

    if (scene !== null && playerMesh !== null) {
      scene.remove(playerMesh)
      console.log(`agent-leave:`, agentId)
    }

    localStore.setDocument('player-mesh', agentId, null)
  })

  remoteStore.on({ type: 'player', event: 'update' }, (agentId, player) => {
    console.log(`agent-update:`, agentId)
  })

  // texture swapping
  remoteStore.on({ type: 'profile', event: 'change' }, (agentId, profile) => {
    const localStore = getLocalStore()
    const playerMesh = localStore.getDocument('player-mesh', agentId)

    if (playerMesh !== null) {
      const material = makePlayerMaterial(agentId)
      playerMesh.material = material;
      playerMesh.needsUpdate = true;
      // console.log(`CHANGE MATERIAL`, agentId, material)
    }
  })

  addActionDownListener('delete', () => {
    console.log(`ACTION > (DELETE)`)
    const store = getRemoteStore()
    const editor = store.getDocument('editor', room.agentId)
    if (editor === null) {
      return
    }

    Portal.remove(getPortalOverPlayer(room.agentId))
    Book.remove(getBookOverPlayer(room.agentId))
    Screen.remove(getScreenOverPlayer(room.agentId))
  })
}

const makePlayerMaterial = (agentId) =>{
  const textureName = getPlayerTextureName(agentId);
  const texture = getTextureByName(textureName, 'player')
  const materialTexture = new THREE.TextureLoader().load(texture.src);
  materialTexture.minFilter = THREE.NearestFilter;
  materialTexture.magFilter = THREE.NearestFilter;
  const material = new THREE.MeshBasicMaterial({
    map: materialTexture,
    side: THREE.DoubleSide,
    transparent: true,
  });
  return material;
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
  const textureName = getPlayerTextureName(id);
  const texture = getTextureByName(textureName, 'player')

  const rot = -(player.rotation.y + rotToThisPlayer + CONST.PI);
  const { uv } = getPlayerSprite(textureName, x, y, rot);
  
  var geometryUv = playerMesh.geometry.getAttribute('uv');

  // 2 3
  // 0 1
  geometryUv.setXY(0, uv.start[0], 1.0 - uv.start[1]);
  geometryUv.setXY(1, uv.end[0], 1.0 - uv.start[1]);
  geometryUv.setXY(2, uv.start[0], 1.0 - uv.end[1]);
  geometryUv.setXY(3, uv.end[0], 1.0 - uv.end[1]);
  geometryUv.needsUpdate = true;

  playerMesh.geometry.setAttribute('uv', geometryUv);

  // Scale
  const aspect = texture.sprites?.aspect ?? texture.aspect ?? 1.0;
  playerMesh.scale.set(
    aspect,
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
  const localStore = getLocalStore()

  const portalId = getPortalOverPlayer(id)
  if (portalId) {
    Portal.travel(portalId)
    return
  }

  const screenId = getScreenOverPlayer(id)
  if (screenId) {
    const currentScreenId = localStore.getDocument('screens', 'editing')
    const newScreenId = screenId != currentScreenId ? screenId : null
    localStore.setDocument('screens', 'editing', newScreenId)
    return
  }

  const bookId = getBookOverPlayer(id)
  if (bookId) {
    Book.read(bookId)
    return
  }

  // Check if you're standing where the document is
  if (getDocumentOverPlayer(id)) {
    localStore.setDocument('show-doc', 'world', true)
    return
  }
}

export const getPortalOverPlayer = (id) => {
  return getInteractableOverPlayer('portal', id)
}

export const getBookOverPlayer = (id) => {
  return getInteractableOverPlayer('book', id)
}

export const getScreenOverPlayer = (id) => {
  return getInteractableOverPlayer('screen', id)
}

export const getDocumentOverPlayer = (id) => {
  const { tileX, tileY, } = getPlayerTile(id)
  return (tileY >= 2 && tileY <= 3 && tileX >= 8.5 && tileX <= 11.5)
}

export const canPlaceOverPlayer = (id) => {
  return (
    getPortalOverPlayer(id) == null && 
    getBookOverPlayer(id) == null && 
    getScreenOverPlayer(id) == null
  );
}

export const getInteractableOverPlayer = (type, id) => {
  const playerRect = getPlayerCollisionRect(id);

  const store = getRemoteStore()
  const ids = store.getIds(type)

  for (const targetId of ids) {
    // This should also take into account the height of the thing, currently if you're in the air
    // not touching a portal you can still use it for travel.
    if (rectanglesOverlap(playerRect, Interactable.getCollisionRect(type, targetId))) {
      return targetId
    }
  }
  return null;
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

export const getPlayerTile = (id) => {
  const store = getRemoteStore()
  const player = store.getDocument('player', id)
  if (player === null) {
    return null
  }
  
  const { x, y } = player.position

  return {
    tileX: Math.floor(x / 32),
    tileY: Math.floor(y / 32),
  }
}

export const getPlayerCollisionRect = (id) => {
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

  x = clamp(x, PLAYER_RADIUS, process.env.BASE_WIDTH - PLAYER_RADIUS)
  y = clamp(y, PLAYER_RADIUS, process.env.BASE_HEIGHT - PLAYER_RADIUS)

  // const tile = getTile('world', x, y)

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

  const textureName = getPlayerTextureName(id);
  const texture = getTextureByName(textureName, 'player')

  // if (texture === null) {
  //   return
  // }

  // strokeCircle(context, getCollisionCircle(id))
  strokeRect(context, getPlayerCollisionRect(id))

  let scale = texture.scale;
  let sWidth = texture.width;
  let sHeight = texture.height;
  let sx = 0;
  let sy = 0;

  if (texture.sprites) {
    scale = texture.sprites.scale ?? scale;
    sWidth = texture.sprites.width;
    sHeight = texture.sprites.height;

    const { pixel } = getPlayerSprite(textureName, x, y, rotation.y);

    sx = pixel.start[0];
    sy = pixel.start[1];
  }

  const dWidth = sWidth * scale;
  const dHeight = sHeight * scale;
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

const getPlayerTextureName = (agentId) => {
  const store = getRemoteStore()
  const profile = store.getDocument('profile', agentId)
  return profile?.spritesheet ?? null;
}

const getPlayerSprite = (textureName, x, y, rot) => {
  let cycleName;

  rot = clampRadians(rot);
  if (Math.abs(rot - CONST.HALF_PI) <= CONST.QUATER_PI) {
    cycleName = 'walkLeft';
  } else if (Math.abs(rot - (CONST.HALF_PI + Math.PI)) <= CONST.QUATER_PI) {
    cycleName = 'walkRight';
  } else if (Math.abs(rot - Math.PI) <= CONST.QUATER_PI) {
    cycleName = 'walkDown';
  } else {
    cycleName = 'walkUp';
  }

  const stepX = x / 32.0;
  const stepY = y / 32.0;

  return getSprite(textureName, stepX, stepY, cycleName)
}
