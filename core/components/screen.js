import * as THREE from 'three'
import { HTMLMesh } from '../HTMLMesh'
import { getTextureImageByName } from '../textures'
import { getLocalStore, getRemoteStore } from '../singleton'
import { getTile, floors } from './map'
import { addActionDownListener } from '../controller'
import * as Interactable from './interactable'

export const TYPE = {
  DOCUMENT: 'document',
}

export const init = () => {
  const localStore = getLocalStore()
  const remoteStore = getRemoteStore()

  const _createScreen = (screenId, screen) => {
    const scene = localStore.getDocument('scene', 'scene')
    if (scene === null) return

    const { position: { x, y }, rotation: { x: rotation } } = screen

    const aspect = process.env.BASE_WIDTH / process.env.BASE_HEIGHT
    const cellHeight = 1.5 //1.2
    const cellWidth = cellHeight * aspect

    const screenElement = document.getElementById(screenId)
    if (screenElement == null) {
      // console.warn(`Screen component [${screenId}] not fond!`)
      return
    }

    const screenMesh = new HTMLMesh(screenElement, cellWidth, cellHeight)
    
    screenMesh.position.set(Math.floor(x) + 0.5, -Math.floor(y) - 0.5, .75)
    screenMesh.rotation.set(Math.PI / 2, rotation, 0)

    scene.add(screenMesh)

    localStore.setDocument('screen-mesh', screenId, screenMesh)
  }

  const _deleteScreen = (screenId) => {
    const scene = localStore.getDocument('scene', 'scene')
    if (scene === null) return

    const screenMesh = localStore.getDocument('screen-mesh', screenId)
    if (screenMesh === null) return

    localStore.setDocument('screen-mesh', screenId, null)
    scene.remove(screenMesh)
  }

  remoteStore.on({ type: 'screen', event: 'create' }, (screenId, screen) => {
    _createScreen(screenId, screen)
  })

  remoteStore.on({ type: 'map', event: 'update' }, (mapId, map) => {
    const screenIds = remoteStore.getIds('screen')

    // update all screens because we don't know what changed
    // TODO: Improve this! (save tile to localStore and compare with new map)
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

  remoteStore.on({ type: 'screen', event: 'delete' }, (screenId) => {
    _deleteScreen(screenId)
  })

  addActionDownListener('syncScreens', async () => {
    const screenIds = remoteStore.getIds('screen')
    for (const screenId of screenIds) {
      // delete if already exists (component could have been remounted)
      _deleteScreen(screenId)

      const screen = remoteStore.getDocument('screen', screenId)
      _createScreen(screenId, screen)
    }
  })
}

const makeScreen = (id, x, y, type, content) => {
  return {
    owner: id,
    permissions: 'rw',
    name: type,
    type,
    content,
    page: 0,
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

export const createDocument = (id, x, y, text) => {
  const screen = {
    ...makeScreen(id, x, y, TYPE.DOCUMENT, text),
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
