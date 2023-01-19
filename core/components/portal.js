import * as THREE from 'three'
import * as Interactable from './interactable'
import { getTextureImageByName } from '../textures'
import { getLocalStore, getRemoteStore } from '../singleton'
import { getTile, floors } from './map'

// Objects should be pushed up so that they are always on top of the terrain.
// I feel like portals should be on an entity layer of fixed environmental stuff...
// This is sort of different from regular entities.
// I guess it depends on if those entities can be on moving platforms.
export const init = () => {
  const localStore = getLocalStore()
  const scene = localStore.getDocument('scene', 'scene')

  if (scene === null) {
    return
  }

  const portalGeometry = new THREE.BoxGeometry(0.8, 0.8, 2.3)
  const portalMaterial = new THREE.MeshBasicMaterial({ color: 'green', transparent: true, opacity: 0.23 })

  const remoteStore = getRemoteStore()

  remoteStore.on({ type: 'portal', event: 'create' }, (id, portal) => {
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
      (Math.floor(portal.position.x)) +0.5 ,
      (-Math.floor(portal.position.y))-0.5,
      currentFloorHeight + .9,
    )

    scene.add(portalMesh)
    localStore.setDocument('portal-mesh', id, portalMesh)
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

  remoteStore.on({ type: 'portal', event: 'delete' }, (id) => {
    const portalMesh = localStore.getDocument('portal-mesh', id)
    if (portalMesh === null) {
      return
    }
    scene.remove(portalMesh)
    localStore.setDocument('portal-mesh', id, null)
  })
}

export const create = (id, x, y, slug) => {
  const portal = {
    slug,
  }
  Interactable.create('portal', id, x, y, portal)
  return portal
}

export const exists = (id) => {
  return Interactable.exists('portal', id)
}

export const travel = (id) => {
  const store = getRemoteStore()
  const portal = store.getDocument('portal', id)

  if (portal !== null) {
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

  context.drawImage(
    portalTexture,
    Math.round(x * 32),
    Math.round(y * 32),
    32,
    32,
  )
}
