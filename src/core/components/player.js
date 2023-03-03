import * as THREE from 'three'
import * as ClientRoom from '@/core/networking'
import * as Settings from '@/core/components/settings'
import * as Map from '@/core/components/map'
import * as Portal from '@/core/components/portal'
import * as Trigger from '@/core/components/trigger'
import * as Screen from '@/core/components/screen'
import * as Interactable from '@/core/components/interactable'
import * as Permission from '@/core/components/permission'
import { getActionState, addActionDownListener } from '@/core/controller'
import { getTextureByName, getTextureSprite } from '@/core/textures'
import { getRemoteStore, getLocalStore } from '@/core/singleton'
import { CONST, clamp, clampRadians, deepCompare, deepCopy } from '@/core/utils'
import { floors, getTile } from '@/core/components/map'
import { strokeRect } from '@/core/rendering/debug-render'
import { getOverlappingTiles, rectanglesOverlap } from '@/core/collisions'
import { spritesheets } from '@/core/texture-data'
import { hashCode } from '@/core/utils'
import Cookies from 'universal-cookie'

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
  const room = ClientRoom.get()

  const remoteStore = getRemoteStore()
  const localStore = getLocalStore()

  localStore.setDocument('joined', room.agentId, false)

  room.on('agent-join', (agentId) => {
    if (agentId === room.agentId) {
      enterRoom(agentId, room.slug)
      return
    }

    const scene = localStore.getDocument('scene', 'scene')
    if (scene === null) {
      return
    }

    const material = makePlayerMaterial(agentId)
    const geometry = new THREE.PlaneGeometry(PLAYER_MESH, PLAYER_MESH);
    const playerMesh = new THREE.Mesh(geometry, material);
    scene.add(playerMesh);

    localStore.setDocument('player-mesh', agentId, playerMesh)
    console.log(`agent-join:`, agentId)
  })

  room.on('agent-leave', (agentId) => {
    const scene = localStore.getDocument('scene', 'scene')
    const playerMesh = localStore.getDocument('player-mesh', agentId)

    if (scene !== null && playerMesh !== null) {
      scene.remove(playerMesh)
    }

    localStore.setDocument('player-mesh', agentId, null)
    console.log(`agent-leave:`, agentId)
  })

  remoteStore.on({ type: 'player', event: 'update' }, (agentId, player) => {
    // console.log(`agent-update:`, agentId)
    if (agentId == room.agentId) {
      // we moved: update all other players
      const playerIds = remoteStore.getIds('player')
      for (const id of playerIds) {
        if (id != room.agentId && room.hasAgentId(id)) {
          update3dSprite(id)
        }
      }
    } else {
      // another player moved
      update3dSprite(agentId)
    }

  })

  // texture swapping
  remoteStore.on({ type: 'profile', event: 'change' }, (agentId, profile) => {
    const playerMesh = localStore.getDocument('player-mesh', agentId)

    if (playerMesh !== null) {
      const material = makePlayerMaterial(agentId)
      playerMesh.material = material;
      playerMesh.needsUpdate = true;
      // console.log(`CHANGE MATERIAL`, agentId, material)
    }
  })

  addActionDownListener('delete', () => {
    const store = getRemoteStore()
    const editor = store.getDocument('editor', room.agentId)
    if (editor === null) {
      return
    }

    Portal.remove(getPortalOverPlayer(room.agentId))
    Trigger.remove(getTriggerOverPlayer(room.agentId))
    Screen.remove(getScreenOverPlayer(room.agentId))
  })
}

const enterRoom = (agentId, slug) => {
  const localStore = getLocalStore()
  localStore.setDocument('joined', agentId, true)

  // from a portal
  const cookies = new Cookies();
  const portalCookie = cookies.get('portal') ?? null
  if (portalCookie) {
    cookies.remove('portal')
    if (portalCookie.agentId == agentId && portalCookie.slug == slug) {
      moveToTile(agentId, portalCookie.tile)
      return
    }
  }

  // go to default entry
  // const remoteStore = getRemoteStore()
  // const settings = remoteStore.getDocument('settings', 'world') ?? Settings.defaultSettings
  // moveToTile(agentId, settings.entry)

  // reset player position
  create(agentId)
}

const makePlayerMaterial = (agentId) =>{
  const texture = getPlayerTexture(agentId)
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

export const update3dSprite = (id) => {
  const room = ClientRoom.get()
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

  // Rotation (billboard) 
  const thisPlayer = remoteStore.getDocument('player', room.agentId)
  const rotToThisPlayer = Math.atan2(y - thisPlayer.position.y, x - thisPlayer.position.x) - CONST.HALF_PI;
  playerMesh.rotation.set(
    CONST.HALF_PI,
    -rotToThisPlayer,
    0
  )

  // UV
  const texture = getPlayerTexture(id)

  const rot = -(player.rotation.y + rotToThisPlayer + CONST.PI);
  const sprite = getPlayerSprite(texture, x, y, rot);
  if(!sprite) return

  const { uv } = sprite
  
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

export const create = (id) => {
  const store = getRemoteStore()
  const settings = store.getDocument('settings', 'world') ?? Settings.defaultSettings

  const entryPosition = Map.fromTileToCanvasPosition(settings.entry.x, settings.entry.y)

  const player = {
    position: {
      x: entryPosition.x,
      y: entryPosition.y,
      z: 0,
    },
    rotation: {
      x: 0,
      y: Math.PI,
      z: 0,
    }
  }

  store.setDocument('player', id, player)

  return player
}

// We should add a delete portal button too.
export const interact = (id) => {
  const portalId = getPortalOverPlayer(id)
  if (portalId) {
    Portal.travel(portalId)
    return
  }

  const triggerId = getTriggerOverPlayer(id)
  if (triggerId) {
    Trigger.switchState(triggerId)
    return
  }

  const localStore = getLocalStore()

  const screenId = getScreenOverPlayer(id)
  if (screenId) {
    const currentScreenId = localStore.getDocument('screens', 'editing')
    const newScreenId = screenId != currentScreenId ? screenId : null

    if (newScreenId && !Permission.canView(newScreenId)) {
      return
    }

    localStore.setDocument('screens', 'editing', newScreenId)
    return
  }
}

export const getPortalOverPlayer = (id) => {
  const portalId = getInteractableOfTypeOverPlayer(id, 'portal')
  return portalId && Permission.canView(portalId) ? portalId : null
}

export const getTriggerOverPlayer = (id) => {
  const triggerId = getInteractableOfTypeOverPlayer(id, 'trigger')
  return triggerId && Permission.canView(triggerId) ? triggerId : null
}

export const getScreenOverPlayer = (id) => {
  if (getPortalOverPlayer(id)) return null
  if (getTriggerOverPlayer(id)) return null

  const localStore = getLocalStore()

  let screenId = null

  const is3d = localStore.getDocument('show-3d', 'world')
  if (is3d) {
    screenId = localStore.getDocument('screens', 'facing-3d')
  } else {
    screenId = getInteractableOfTypeOverPlayer(id, 'screen')
  }

  return screenId && Permission.canView(screenId) ? screenId : null
}

export const canPlaceOverPlayer = (id) => {
  return (
    getPortalOverPlayer(id) == null && 
    getScreenOverPlayer(id) == null &&
    getTriggerOverPlayer(id) == null
  );
}

const getInteractableOfTypeOverPlayer = (id, type) => {
  const target = getInteractableOverPlayer(id)
  return target?.type == type ? target.id : null
}

const getInteractableOverPlayer = (id) => {
  const playerRect = getPlayerCollisionRect(id);
  if (playerRect == null) {
    return
  }

  const store = getRemoteStore()
  for (const type of ['portal', 'trigger', 'screen']) {
    const ids = store.getIds(type)
    for (const id of ids) {
      if (rectanglesOverlap(playerRect, Interactable.getCollisionRect(type, id))) {
        return {
          type,
          id,
        }
      }
    }
  }
  return null;
}


export const exists = (id) => {
  const store = getRemoteStore()
  const player = store.getDocument('player', id)

  return player !== null
}

export const moveToTile = (id, tile) => {
  const store = getRemoteStore()
  let player = store.getDocument('player', id)
  if (player === null) {
    return null
  }
  
  const position = Map.fromTileToCanvasPosition(tile?.x, tile?.y)
  player.position.x = position.x
  player.position.y = position.y
  store.setDocument('player', id, player)
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

export const getPlayerTileRotation = (id) => {
  const store = getRemoteStore()
  const player = store.getDocument('player', id)
  if (player === null) {
    return null
  }
  
  const { x, y } = player.position
  const { y: rot } = player.rotation

  return {
    x: Math.floor(x / 32),
    y: Math.floor(y / 32),
    rot,
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
    if (getActionState('up') || getActionState('moveForward')) {
      speedY -= SPEED;
    }
    if (getActionState('down') || getActionState('moveBack')) {
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
  const remoteStore = getRemoteStore()
  const localStore = getLocalStore()

  const player = remoteStore.getDocument('player', id)
  if (player === null) return

  const joined = localStore.getDocument('joined', id) ?? null
  if (joined === false) return

  const { position: { x, y }, rotation } = player

  const texture = getPlayerTexture(id)
  if (!texture) return // texture not loaded yet

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

    const { pixel } = getPlayerSprite(texture, x, y, rotation.y);

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

export const getPlayerTexture = (agentId = '') => {
  const store = getRemoteStore()
  const profile = store.getDocument('profile', agentId)

  let texture = getTextureByName(profile?.spritesheet)

  if(!texture) {
    texture = getTextureByName(getPlayerTextureName(agentId))
  }

  return texture
}

export const getPlayerTextureName = (agentId = '') => {
  const index = Math.abs(hashCode(agentId)) % spritesheets.length
  return spritesheets[index].src
}


const getPlayerSprite = (texture, x, y, rot) => {
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

  return getTextureSprite(texture, stepX, stepY, cycleName)
}

