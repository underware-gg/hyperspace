import * as THREE from 'three'
import RoomCollection from '@/core/interfaces/RoomCollection'
import { getTextureSprite } from '@/core/textures'
import { CONST, clamp, clampRadians, deepCompare, deepCopy } from '@/core/utils'
import { getOverlappingTiles, rectanglesOverlap } from '@/core/collisions'
import { floors } from '@/core/components/map'
import Cookies from 'universal-cookie'

// all sizes, positions and dimensions are relative to tiles
const SPEED = 4
const PLAYER_BOX = 0.5
const PLAYER_RADIUS = 0.25
const PLAYER_MESH = 1.4
const CAM_Z_OFFSET = 1.15
const STEP_SIZE = 0.75

// physics
const GRAVITY = 0.6
const MAX_Z_SPEED = 2
const JUMP_VELOCITY = 0.1

class Player extends RoomCollection {
  constructor(room) {
    super(room, 'player')

    this.localStore.setDocument('joined', this.agentId, false)
    this.localStore.setDocument('velocity', this.agentId, 0)

    this.actions.addActionDownListener('interact', () => {
      this.interact(this.agentId)
    })

    this.actions.addActionDownListener('delete', () => {
      const editor = this.sessionStore.getDocument('editor', this.agentId)
      if (editor === null) return
      
      this.Portal.remove(this.getPortalOverPlayer(this.agentId), true)
      this.Trigger.remove(this.getTriggerOverPlayer(this.agentId), true)
      this.Screen.remove(this.getScreenOverPlayer(this.agentId), true)
    })

    this.clientRoom.on('agent-join', (agentId) => {
      this.localStore.setDocument('joined', agentId, true)

      if (agentId === this.agentId) {
        console.log(`[${this.slug}] player-join:`, agentId, '(YOU)')
        this.enterRoom(agentId, this.slug)
        return
      }

      let playerMesh = null

      // has 3d render
      const scene = this.localStore.getDocument('scene', 'scene')
      if (scene) {
        const material = this.makePlayerMaterial(agentId)
        const geometry = new THREE.PlaneGeometry(PLAYER_MESH, PLAYER_MESH)

        playerMesh = new THREE.Mesh(geometry, material)

        scene.add(playerMesh)
      }

      this.localStore.setDocument('player-mesh', agentId, playerMesh)
      console.log(`[${this.slug}] player-join:`, agentId)
    })

    this.clientRoom.on('agent-leave', (agentId) => {
      const playerMesh = this.localStore.getDocument('player-mesh', agentId)

      const scene = this.localStore.getDocument('scene', 'scene')
      if (scene !== null && playerMesh !== null) {
        scene.remove(playerMesh)
      }

      this.localStore.setDocument('player-mesh', agentId, null)
      console.log(`[${this.slug}] agent-leave:`, agentId)
    })

    this.sessionStore.on({ type: 'player', event: 'update' }, (agentId, player) => {
      // console.log(`[${this.slug}] agent-update:`, agentId)
      if (agentId == this.agentId) {
        // we moved: update all other players
        const playerIds = this.sessionStore.getIds('player')
        for (const id of playerIds) {
          if (id != this.agentId && this.clientRoom.hasAgentId(id)) {
            this.update3dSprite(id)
          }
        }
      } else {
        // another player moved
        this.update3dSprite(agentId)
      }
    })

    // texture swapping
    this.agentStore.on({ type: 'profile', event: 'change' }, (agentId, profile) => {
      this.updatePlayerTexture(agentId)
    })
    this.agentStore.on({ type: 'wallet', event: 'change' }, (agentId, wallet) => {
      if (!wallet || wallet.walletType == 'Agent') {
        this.updatePlayerTexture(agentId)
      }
    })
  }

  updatePlayerTexture(agentId) {
    const playerMesh = this.localStore.getDocument('player-mesh', agentId)
    if (!playerMesh) return

    const material = this.makePlayerMaterial(agentId)
    playerMesh.material = material
    playerMesh.needsUpdate = true
    this.update3dSprite(agentId)
  }

  makePlayerMaterial(agentId) {
    const texture = this.Profile.getProfileTexture(agentId)
    const materialTexture = new THREE.TextureLoader().load(texture.src)
    materialTexture.minFilter = THREE.NearestFilter
    materialTexture.magFilter = THREE.NearestFilter
    const material = new THREE.MeshBasicMaterial({
      map: materialTexture,
      side: THREE.DoubleSide,
      transparent: true,
    })
    return material
  }

  update3dSprite(id) {
    if (id === this.agentId) {
      return
    }

    const playerMesh = this.localStore.getDocument('player-mesh', id)
    if (!playerMesh) return

    const player = this.sessionStore.getDocument('player', id)
    if (!player) return

    // Position
    const { position: { x, y, z }, rotation } = player
    playerMesh.position.set(
      x,
      -y,
      z + PLAYER_MESH / 2,
    )

    // Rotation (billboard) 
    const thisPlayer = this.sessionStore.getDocument('player', this.agentId)
    const rotToThisPlayer = Math.atan2(y - thisPlayer.position.y, x - thisPlayer.position.x) - CONST.HALF_PI
    playerMesh.rotation.set(
      CONST.HALF_PI,
      -rotToThisPlayer,
      0
    )

    // UV
    const texture = this.Profile.getProfileTexture(id)

    const rot = -(player.rotation.y + rotToThisPlayer + CONST.PI)
    const sprite = this.getPlayerSprite(texture, x, y, rot)
    if (!sprite) return

    const { uv } = sprite

    var geometryUv = playerMesh.geometry.getAttribute('uv')

    // 2 3
    // 0 1
    geometryUv.setXY(0, uv.start[0], 1.0 - uv.start[1])
    geometryUv.setXY(1, uv.end[0], 1.0 - uv.start[1])
    geometryUv.setXY(2, uv.start[0], 1.0 - uv.end[1])
    geometryUv.setXY(3, uv.end[0], 1.0 - uv.end[1])
    geometryUv.needsUpdate = true

    playerMesh.geometry.setAttribute('uv', geometryUv)

    // Scale
    const aspect = texture.sprites?.aspect ?? texture.aspect ?? 1.0
    playerMesh.scale.set(
      aspect,
      1.0,
      1
    )

  }

  // We should add a delete portal button too.
  interact(id) {
    const portalId = this.getPortalOverPlayer(id)
    if (portalId) {
      this.Portal.travel(portalId)
      return
    }

    const triggerId = this.getTriggerOverPlayer(id)
    if (triggerId) {
      this.Trigger.switchState(triggerId)
      return
    }

    const screenId = this.getScreenOverPlayer(id)
    if (screenId) {
      const currentScreenId = this.localStore.getDocument('screens', 'editing')
      const newScreenId = screenId != currentScreenId ? screenId : null

      if (newScreenId && !this.canView(newScreenId)) {
        return
      }

      this.localStore.setDocument('screens', 'editing', newScreenId)
      return
    }
  }

  getPortalOverPlayer(id) {
    const portalId = this.getObjectOfTypeOverPlayer(id, 'portal')
    return portalId && this.canView(portalId) ? portalId : null
  }

  getTriggerOverPlayer(id) {
    const triggerId = this.getObjectOfTypeOverPlayer(id, 'trigger')
    return triggerId && this.canView(triggerId) ? triggerId : null
  }

  getScreenOverPlayer(id) {
    if (this.getPortalOverPlayer(id)) return null
    if (this.getTriggerOverPlayer(id)) return null

    let screenId = null

    const profile = this.Profile.getCurrentProfile()
    if (profile.view3d) {
      screenId = this.localStore.getDocument('screens', 'facing-3d')
    } else {
      screenId = this.getObjectOfTypeOverPlayer(id, 'screen')
    }

    return screenId && this.canView(screenId) ? screenId : null
  }

  canPlaceOverPlayer(id) {
    return (
      this.getPortalOverPlayer(id) == null &&
      this.getScreenOverPlayer(id) == null &&
      this.getTriggerOverPlayer(id) == null
    )
  }

  getObjectOfTypeOverPlayer(id, type) {
    const target = this.getObjectOverPlayer(id)
    return target?.type == type ? target.id : null
  }

  getObjectOverPlayer(id) {
    const playerRect = this.getPlayerCollisionRect(id)
    if (playerRect == null) return

    for (const type of ['portal', 'trigger', 'screen']) {
      const ids = this.remoteStore.getIds(type)
      for (const id of ids) {
        const rect = this.getCollisionRect(type, id)
        if (rect && rectanglesOverlap(playerRect, rect)) {
          return {
            type,
            id,
          }
        }
      }
    }
    return null
  }

  getCollisionRect(type, id) {
    const data = this.remoteStore.getDocument(type, id)
    if (!data || !data.position) return null
    return {
      position: data.position,
      size: {
        width: 1,
        height: 1,
      },
    }
  }

  enterRoom(agentId, slug) {
    const cookies = new Cookies()

    // portal navigation
    let portalCookie = cookies.get('portal') ?? null
    if (portalCookie) {
      if (portalCookie.agentId == agentId) {
        // coming in from a portal
        if (portalCookie.to == slug) {
          portalCookie.to = null
          cookies.set('portal', JSON.stringify(portalCookie), { path: '/' })
          this.moveToTile(agentId, portalCookie.entry)
          return
        }
        // coming back from a portal
        if (portalCookie.from == slug) {
          cookies.remove('portal')
          this.moveToTile(agentId, portalCookie.exit)
          return
        }
      }
      cookies.remove('portal')
    }

    // go to default entry
    const settings = this.Settings.get('world')
    this.moveToTile(agentId, settings.entry)
  }

  moveToTile(id, tile) {
    let player = this.sessionStore.getDocument('player', id)

    if (player === null) {
      player = {
        position: {
          x: 0,
          y: 0,
          z: 0,
        },
        rotation: {
          x: 0,
          y: Math.PI,
          z: 0,
        }
      }
    }

    if (!this.Map.validateTile(tile?.x, tile?.y)) {
      const settings = this.Settings.get('world')
      tile = settings.entry
    }

    player.position.x = tile.x + 0.5
    player.position.y = tile.y + 1 - PLAYER_RADIUS - 0.01

    this.sessionStore.setDocument('player', id, player)
  }

  getPlayerTileRotation(id) {
    const player = this.sessionStore.getDocument('player', id)
    if (!player) return null

    const { x, y } = player.position
    const { y: rot } = player.rotation

    return {
      x: Math.floor(x),
      y: Math.floor(y),
      rot,
    }
  }

  getPlayerCollisionRect(id) {
    const player = this.sessionStore.getDocument('player', id)
    if (!player) return null

    const { x, y } = player.position

    return this.fromPosToRect(x, y)
  }

  fromPosToRect(x, y) {
    return {
      position: {
        x: (x - PLAYER_RADIUS),
        y: (y - PLAYER_RADIUS),
      },
      size: {
        width: PLAYER_BOX,
        height: PLAYER_BOX,
      },
    }
  }

  update(id, dt) {
    const player = this.sessionStore.getDocument('player', id)
    if (player === null) {
      return
    }

    let { position: { x, y, z }, rotation } = player
    const rotationCopy = deepCopy(rotation)

    const profile = this.Profile.getCurrentProfile()
    const view3d = profile.view3d ?? false

    // Compute new XY position

    if (view3d) {
      const angle = new THREE.Euler(CONST.HALF_PI, rotation.y, rotation.z)

      const forward = new THREE.Vector3(0, 0, 1)
      const right = new THREE.Vector3(1, 0, 0)

      forward.applyEuler(angle)
      right.applyEuler(angle)

      const forwardMove = new THREE.Vector3(0, 0, 0)
      const sideMove = new THREE.Vector3(0, 0, 0)

      forwardMove.add(forward.setLength(SPEED))
      sideMove.add(right.setLength(SPEED))

      if (this.actions.getActionState('left')) {
        x -= sideMove.x * dt
        y += sideMove.y * dt
      }

      if (this.actions.getActionState('right')) {
        x += sideMove.x * dt
        y -= sideMove.y * dt
      }

      if (this.actions.getActionState('up')) {
        x -= forwardMove.x * dt
        y += forwardMove.y * dt
      }

      if (this.actions.getActionState('down')) {
        x += forwardMove.x * dt
        y -= forwardMove.y * dt
      }

      if (this.actions.getActionState('turnLeft')) {
        rotationCopy.y += Math.PI * dt
      }
      if (this.actions.getActionState('turnRight')) {
        rotationCopy.y -= Math.PI * dt
      }
      if (this.actions.getActionState('moveBack')) {
        rotationCopy.x -= Math.PI * dt * 0.75
        if (rotationCopy.x < -Math.PI * 0.25) {
          rotationCopy.x = -Math.PI * 0.25
        }
      }
      if (this.actions.getActionState('moveForward')) {
        rotationCopy.x += Math.PI * dt * 0.75
        if (rotationCopy.x > Math.PI * 0.15) {
          rotationCopy.x = Math.PI * 0.15
        }
      }

    } else {
      let speedX = 0
      let speedY = 0

      if (this.actions.getActionState('left') || this.actions.getActionState('turnLeft')) {
        speedX -= SPEED
      }
      if (this.actions.getActionState('right') || this.actions.getActionState('turnRight')) {
        speedX += SPEED
      }
      if (this.actions.getActionState('up') || this.actions.getActionState('moveForward')) {
        speedY -= SPEED
      }
      if (this.actions.getActionState('down') || this.actions.getActionState('moveBack')) {
        speedY += SPEED
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

    // Clamp position within walls and world boundaries

    const mapBounds = this.localStore.getDocument('mapBounds', 'world')
    if (mapBounds) {
      x = clamp(x, mapBounds.start.x + PLAYER_RADIUS, mapBounds.end.x + 1 - PLAYER_RADIUS)
      y = clamp(y, mapBounds.start.y + PLAYER_RADIUS, mapBounds.end.y + 1 - PLAYER_RADIUS)
    }

    const overlappingTilesX = getOverlappingTiles(this.fromPosToRect(x, player.position.y), 1)
    for (const tile of overlappingTilesX) {
      const tileIndex = this.Map.getTile('world', tile.x, tile.y)
      const floorHeight = floors[tileIndex]
      if (tileIndex == null || (floorHeight - z) > STEP_SIZE) {
        x = player.position.x
        break
      }
    }

    const overlappingTilesY = getOverlappingTiles(this.fromPosToRect(player.position.x, y), 1)
    for (const tile of overlappingTilesY) {
      const tileIndex = this.Map.getTile('world', tile.x, tile.y)
      const floorHeight = floors[tileIndex]
      if (tileIndex == null || (floorHeight - z) > STEP_SIZE) {
        y = player.position.y
        break
      }
    }

    // calculate velocity and vertical position

    let velocity = this.localStore.getDocument('velocity', this.agentId)

    if (this.actions.getActionState('jump') && velocity == 0) {
      velocity = JUMP_VELOCITY
    } else {
      velocity -= GRAVITY * dt;
      velocity = Math.min(velocity, MAX_Z_SPEED)
    }

    z += velocity

    // ground player

    const overlappingTilesXY = getOverlappingTiles(this.fromPosToRect(x, y), 1)

    let tilesUnderPlayer = 0
    for (const tile of overlappingTilesXY) {
      const tileIndex = this.Map.getTile('world', tile.x, tile.y)
      if (tileIndex !== null) {
        tilesUnderPlayer++
        const floorHeight = floors[tileIndex]
        if (z < floorHeight) {
          z = floorHeight
          velocity = 0
        }
      }
    }

    if (tilesUnderPlayer == 0) {
      console.log(`No ground! Move to entry...`)
      const settings = this.Settings.get('world')
      this.moveToTile(this.agentId, settings.entry)
      return
    }

    if (player.position.x !== x || player.position.y !== y || player.position.z !== z || deepCompare(rotation, rotationCopy) === false) {
      // console.log(`moved xyz/r:`, x.toFixed(2), y.toFixed(2), z.toFixed(2), toDegrees(rotationCopy.y))
      rotationCopy.y = clampRadians(rotationCopy.y)
      this.sessionStore.setDocument('player', id, {
        position: {
          x,
          y,
          z,
        },
        rotation: rotationCopy,
      })
    }

    this.localStore.setDocument('velocity', this.agentId, velocity)

    const camera = this.localStore.getDocument('camera', 'camera')
    const cameraOrbit = this.localStore.getDocument('cameraOrbit', 'cameraOrbit')

    if (camera && cameraOrbit) {
      cameraOrbit.position.set(
        x,
        -y,
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

  render2d(id, context) {
    const player = this.sessionStore.getDocument('player', id)
    if (!player) return

    const joined = this.localStore.getDocument('joined', id) ?? null
    if (!joined) return

    const { position: { x, y }, rotation } = player

    const texture = this.Profile.getProfileTexture(id)
    if (!texture) return // texture not loaded yet

    const rect = this.getPlayerCollisionRect(id)
    this.Map.drawRect(context, rect.position.x, rect.position.y, rect.size.width, rect.size.height, 0.05, 'red')

    let scale = texture.scale
    let sWidth = texture.width
    let sHeight = texture.height
    let sx = 0
    let sy = 0

    if (texture.sprites) {
      scale = texture.sprites.scale ?? scale
      sWidth = texture.sprites.width
      sHeight = texture.sprites.height

      const { pixel } = this.getPlayerSprite(texture, x, y, rotation.y)

      sx = pixel.start[0]
      sy = pixel.start[1]
    }

    const dWidth = (sWidth * scale) / process.env.TILE_SIZE
    const dHeight = (sHeight * scale) / process.env.TILE_SIZE
    const dx = (x - (dWidth / 2))
    const dy = (y - dHeight + PLAYER_RADIUS)

    context.drawImage(
      texture.image,
      sx, sy,
      sWidth, sHeight,
      dx, dy,
      dWidth, dHeight,
    )

  }

  getPlayerSprite(texture, x, y, rot) {
    let cycleName

    rot = clampRadians(rot)
    if (Math.abs(rot - CONST.HALF_PI) <= CONST.QUATER_PI) {
      cycleName = 'walkLeft'
    } else if (Math.abs(rot - (CONST.HALF_PI + Math.PI)) <= CONST.QUATER_PI) {
      cycleName = 'walkRight'
    } else if (Math.abs(rot - Math.PI) <= CONST.QUATER_PI) {
      cycleName = 'walkDown'
    } else {
      cycleName = 'walkUp'
    }

    return getTextureSprite(texture, x + y, cycleName)
  }
}

export default Player
