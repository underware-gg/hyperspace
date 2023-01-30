import * as THREE from 'three'
import * as Interactable from './interactable'
import { getTextureImageByName } from '../textures'
import { getLocalStore, getRemoteStore } from '../singleton'
import { getTile, floors } from './map'
import { createRenderTexture } from '../textures'

export const init = () => {
  const localStore = getLocalStore()
  const scene = localStore.getDocument('scene', 'scene')

  if (scene === null) {
    return
  }

  //const portalGeometry = new THREE.BoxGeometry(0.8, 0.8, 2.3)
  //const portalMaterial = new THREE.MeshBasicMaterial({ color: 'pink', transparent: true, opacity: 0.23 })

  const remoteStore = getRemoteStore()

  remoteStore.on({ type: 'screen', event: 'create' }, (id, portal) => {
    const documentTexture = createRenderTexture(process.env.BASE_WIDTH, process.env.BASE_HEIGHT)
    const portalMaterial = new THREE.MeshBasicMaterial({
      // map: documentTexture.texture,
      color: '#ffe7a3'
    })

    const portalGeometry = new THREE.BoxGeometry(1.28, 0.01, 0.86)

    const portalMesh = new THREE.Mesh(portalGeometry, portalMaterial)

    const map = remoteStore.getDocument('map', 'world')

    if (map === null) {
      return
    }

    const tile = getTile('world', portal.position.x, portal.position.y)

    if (tile === null) {
      return
    }

    //Update Refs
    // renderMarkdown("", documentTexture.canvas, documentTexture.context)
    // documentTexture.texture.needsUpdate = true

    const currentFloorHeight = floors[tile]

    portalMesh.position.set(
      (Math.floor(portal.position.x)) + 0.5,
      (-Math.floor(portal.position.y)) - 0.05,
      currentFloorHeight + 1.2,
    )
    scene.add(portalMesh)
    localStore.setDocument('screen-mesh', id, portalMesh)
    localStore.setDocument('screen-texture', id, documentTexture)
  })

  // If we had something that said "how the data has changed" it would help a lot.
  remoteStore.on({ type: 'map', event: 'update' }, (id, map) => {
    if (id !== 'world') {
      return
    }

    const screenIds = remoteStore.getIds('screen')

    for (const screenId of screenIds) {
      const screen = remoteStore.getDocument('screen', screenId)

      if (screen === null) {
        continue
      }

      const { position: { x, y } } = screen

      const tile = getTile('world', x, y)

      if (tile === null) {
        continue
      }

      const currentFloorHeight = floors[tile]

      const screenMesh = localStore.getDocument('screen-mesh', screenId)

      if (screenMesh === null) {
        return
      }

      screenMesh.position.set(
        (Math.floor(x)) + 0.5,
        (-Math.floor(y)) - 0.05,
        currentFloorHeight + 1.2,
      )
    }
  })

  remoteStore.on({ type: 'screen', event: 'delete' }, (id) => {
    const portalMesh = localStore.getDocument('screen-mesh', id)
    if (portalMesh === null) {
      return
    }
    scene.remove(portalMesh)
    localStore.setDocument('screen-mesh', id, null)
  })
}

const SCREEN_TYPE = {
  DOCUMENT: 'document',
}

const makeScreen = (id, x, y, type) => {
  return {
    owner: id,
    permissions: 'rw',
    name: type,
    type,
    content: '',
    items: '',
    position: 0,
    visible: true,
    position: {
      x: x,
      y: y,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
    },
  }
}

export const create = (id, x, y, text) => {
  const screen = {
    ...makeScreen(id, x, y, SCREEN_TYPE.DOCUMENT),
  }
  Interactable.create('screen', id, x, y, screen)
  return screen
}

export const exists = (id) => {
  return Interactable.exists('screen', id)
}

export const remove = (id) => {
  return Interactable.remove('screen', id)
}

export const read = (id) => {
  const store = getRemoteStore()
  const screen = store.getDocument('screen', id)

  if (screen !== null) {
    console.log("SCREEN TEXT " + screen.text)
    //window.location.href = `/${portal.slug}`
  }
}

export const getCollisionRect = (id) => {
  return Interactable.getCollisionRect('screen', id)
}

export const render2d = (id, context) => {
  const store = getRemoteStore()
  const screen = store.getDocument('screen', id)

  if (screen === null) {
    return
  }

  const { position: { x, y } } = screen

  // This should be replaced with a sprite eventually.
  // const documentTexture = getLocalStore().getDocument('screen-texture', id)
  // renderMarkdown(screen.text, documentTexture.canvas, documentTexture.context)
  // documentTexture.texture.needsUpdate = true

  const screenTexture = getTextureImageByName('screen')

  context.drawImage(
    screenTexture,
    Math.round(x * 32),
    Math.round(y * 32),
    32,
    32,
  )
}
