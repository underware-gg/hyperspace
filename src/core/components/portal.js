import * as THREE from 'three'
import * as Room from '@/core/networking'
import * as Interactable from '@/core/components/interactable'
import * as Permission from '@/core/components/permission'
import * as Player from '@/core/components/player'
import { getTextureImageByName } from '@/core/textures'
import { getLocalStore, getRemoteStore } from '@/core/singleton'
import { getPortalOverPlayer } from '@/core/components/player'
import { getTile, floors } from '@/core/components/map'
import Cookies from 'universal-cookie';

// Objects should be pushed up so that they are always on top of the terrain.
// I feel like portals should be on an entity layer of fixed environmental stuff...
// This is sort of different from regular entities.
// I guess it depends on if those entities can be on moving platforms.
export const init = () => {
  const remoteStore = getRemoteStore()
  const localStore = getLocalStore()
  const scene = localStore.getDocument('scene', 'scene')

  if (scene === null) {
    return
  }

  const portalGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 32, 1, true)

  const portalMaterial = new THREE.MeshLambertMaterial({
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    color: '#fff',
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  })
  
  remoteStore.on({ type: 'portal', event: 'create' }, (portalId, portal) => {
    const portalMesh = new THREE.Mesh(portalGeometry, portalMaterial)

    const map = remoteStore.getDocument('map', 'world')

    if (map === null) {
      return
    }

    const tile = getTile('world', portal.position.x, portal.position.y)

    if (tile === null) {
      return
    }

    const currentFloorHeight = floors[tile]

    portalMesh.position.set(
      (Math.floor(portal.position.x)) + 0.5,
      (-Math.floor(portal.position.y)) - 0.5,
      currentFloorHeight + .9,
    )
    portalMesh.rotation.set(Math.PI / 2, 0, 0);

    scene.add(portalMesh)
    localStore.setDocument('portal-mesh', portalId, portalMesh)
  })

  remoteStore.on({ type: 'portal', event: 'delete' }, (portalId) => {
    const portalMesh = localStore.getDocument('portal-mesh', portalId)
    if (portalMesh === null) {
      return
    }
    scene.remove(portalMesh)
    localStore.setDocument('portal-mesh', portalId, null)
  })

  // If we had something that said "how the data has changed" it would help a lot.
  remoteStore.on({ type: 'map', event: 'update' }, (id, map) => {
    if (id !== 'world') {
      return
    }

    const portalIds = remoteStore.getIds('portal')

    for (const portalId of portalIds) {
      const portal = remoteStore.getDocument('portal', portalId)

      if (portal === null) {
        continue
      }

      // if the portal exists, get the tile that it is sitting on
      const tile = getTile('world', portal.position.x, portal.position.y)

      if (tile === null) {
        continue
      }

      const currentFloorHeight = floors[tile]

      const portalMesh = localStore.getDocument('portal-mesh', portalId)

      if (portalMesh === null) {
        return
      }

      // maybe we should be updating the y position of the portal but
      // for now we will just update where the render happens.
      portalMesh.position.set(
        (Math.floor(portal.position.x)) +0.5,
        (-Math.floor(portal.position.y))-0.5,
        currentFloorHeight + .9,
      )
    }
  })
}

export const create = (id, x, y, slug, tile) => {
  const portal = {
    slug,
    tile,
  }
  Interactable.create('portal', id, x, y, portal)
  return portal
}

export const updatePortal = (id, values) => {
  const store = getRemoteStore()
  let portal = store.getDocument('portal', id)
  if (portal == null) return

  if (!Permission.canEdit(id)) {
    console.warn(`No permission to update Portal [${id}] to [${portal.slug}]`)
    return
  }

  store.setDocument('portal', id, {
    ...portal, ...values
  })
}

export const exists = (id) => {
  return Interactable.exists('portal', id)
}

export const remove = (id) => {
  if (!Permission.canEdit(id)) {
    console.warn(`No permission to delete Portal [${id}]`)
    return
  }
  return Interactable.remove('portal', id)
}

export const travel = (id) => {
  const store = getRemoteStore()
  const portal = store.getDocument('portal', id)
  if (portal == null) return

  if (!Permission.canView(id)) {
    console.warn(`No permission to enter Portal [${id}]`)
    return
  }

  // Travel to the same room
  const room = Room.get()
  if (room.slug == portal.slug) {
    Player.moveToTile(room.agentId, portal.tile)
  } else {
    // Travel to other Room
    const data = {
      agentId: room.agentId,
      from: room.slug,
      slug: portal.slug,
      tile: portal.tile ?? null,
    }
    const cookies = new Cookies();
    cookies.set('portal', JSON.stringify(data), { path: '/' });
    window.location.href = `/${portal.slug}`
  }
}

export const getCollisionRect = (id) => {
  return Interactable.getCollisionRect('portal', id)
}

export const render2d = (id, context) => {
  const store = getRemoteStore()
  const portal = store.getDocument('portal', id)

  if (portal === null) {
    return
  }

  const { position: { x, y } } = portal

  const portalTexture = getTextureImageByName('portal')

  const room = Room.get()

  let t = 0
  if (getPortalOverPlayer(room.agentId) == id) {
    t = new Date().getTime() / 10000;
  }

  context.save()
  context.translate(Math.round(x * 32 + 16), Math.round(y * 32 + 16));
  context.rotate((t % 1) * Math.PI * 2);
  context.translate(-16, -16);
  context.drawImage(
    portalTexture,
    0,
    0,
    32,
    32,
  )
  context.restore();
}
