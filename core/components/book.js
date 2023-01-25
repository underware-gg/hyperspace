import * as THREE from 'three'
import * as Interactable from './interactable'
import { getTextureImageByName } from '../textures'
import { getLocalStore, getRemoteStore } from '../singleton'
import { getTile, floors } from './map'
import { createRenderTexture } from '../textures'
import { renderMarkdown } from '../canvas-markdown'

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

  //const portalGeometry = new THREE.BoxGeometry(0.8, 0.8, 2.3)
  //const portalMaterial = new THREE.MeshBasicMaterial({ color: 'pink', transparent: true, opacity: 0.23 })

  const remoteStore = getRemoteStore()

  remoteStore.on({ type: 'book', event: 'create' }, (id, portal) => {
    const documentTexture = createRenderTexture(process.env.BASE_WIDTH, process.env.BASE_HEIGHT)
    const portalMaterial = new THREE.MeshBasicMaterial({
       map: documentTexture.texture,
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
    renderMarkdown("", documentTexture.canvas, documentTexture.context)
    documentTexture.texture.needsUpdate = true

    const currentFloorHeight = floors[tile]

    portalMesh.position.set(
      (Math.floor(portal.position.x)) +0.5,
      (-Math.floor(portal.position.y)) -0.05,
      currentFloorHeight + 1.2,
    )
    scene.add(portalMesh)
    localStore.setDocument('book-mesh', id, portalMesh)
    localStore.setDocument('book-texture', id, documentTexture)
  })

  // If we had something that said "how the data has changed" it would help a lot.
  remoteStore.on({ type: 'map', event: 'update' }, (id, map) => {
    if (id !== 'world') {
      return
    }

    const portalIds = remoteStore.getIds('book')

    for (const portalId of portalIds) {
      const portal = remoteStore.getDocument('book', portalId)

      if (portal === null) {
        continue
      }

      // if the portal exists, get the tile that it is sitting on
      const tile = getTile('world', portal.position.x, portal.position.y)

      if (tile === null) {
        continue
      }

      const currentFloorHeight = floors[tile]

      const portalMesh = localStore.getDocument('book-mesh', portalId)

      if (portalMesh === null) {
        return
      }

      // maybe we should be updating the y position of the portal but
      // for now we will just update where the render happens.
      portalMesh.position.set(
        (Math.floor(portal.position.x)) +0.5,
        (-Math.floor(portal.position.y))-0.05,
        currentFloorHeight + 1.2,
      )
    }
  })

  remoteStore.on({ type: 'book', event: 'delete' }, (id) => {
    const portalMesh = localStore.getDocument('book-mesh', id)
    if (portalMesh === null) {
      return
    }
    scene.remove(portalMesh)
    localStore.setDocument('book-mesh', id, null)
  })
}

export const create = (id, x, y, text) => {
  const book = {
    text,
  }
  Interactable.create('book', id, x, y, book)
  return book
}

export const exists = (id) => {
  return Interactable.exists('book', id)
}

export const read = (id) => {
  const store = getRemoteStore()
  const book = store.getDocument('book', id)

  if (book !== null) {
    console.log("READ BOOK " + id)
    console.log("BOOK TEXT " + book.text)
    //window.location.href = `/${portal.slug}`
  }
}

export const getCollisionRect = (id) => {
  return Interactable.getCollisionRect('book', id)
}

export const render2d = (id, context) => {
  const store = getRemoteStore()
  const book = store.getDocument('book', id)

  if (book === null) {
    return
  }

  const { position: { x, y } } = book

  // This should be replaced with a sprite eventually.
  const documentTexture = getLocalStore().getDocument('book-texture', id)
  renderMarkdown(book.text, documentTexture.canvas, documentTexture.context)
  documentTexture.texture.needsUpdate = true

  const bookTexture = getTextureImageByName('book')

  context.drawImage(
    bookTexture,
    Math.round(x * 32),
    Math.round(y * 32),
    32,
    32,
  )
}
