import { HTMLMesh } from '@/core/rendering/HTMLMesh'
import { getTextureImageByName } from '@/core/textures'
import { getLocalStore, getRemoteStore } from '@/core/singleton'
import { getTile, floors } from '@/core/components/map'
import { addActionDownListener } from '@/core/controller'
import { getScreenOverPlayer } from '@/core/components/player'
import * as Interactable from '@/core/components/interactable'

export const TYPE = {
  DOCUMENT: 'document',
  PDF_BOOK: 'pdf_book',
}

export const isMultiline = (type) => {
  return type == (TYPE.DOCUMENT)
}

export const hasPageControl = (type) => {
  return type == (TYPE.PDF_BOOK)
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
    // console.warn(`HTML Screen element [${screenId}]:`, screenElement)

    const screenMesh = new HTMLMesh(screenElement, cellWidth, cellHeight, true)
    
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

export const exists = (id) => {
  return Interactable.exists('screen', id)
}

export const remove = (id) => {
  return Interactable.remove('screen', id)
}

export const getCollisionRect = (id) => {
  return Interactable.getCollisionRect('screen', id)
}

export const render2d = (id, context, agentId) => {
  const store = getRemoteStore()
  const screen = store.getDocument('screen', id)

  if (screen === null) {
    return
  }

  const { position: { x, y } } = screen

  let textureName = screen.type
  let textureNameOver = screen.type
  if (agentId && id == getScreenOverPlayer(agentId)) {
    textureNameOver += `_over`
  }
  let screenTexture = getTextureImageByName(textureNameOver, textureName)

  if (screenTexture == null) {
    console.warn(`Screen texture not found`, textureNameOver, textureName)
    return
  }

  context.drawImage(
    screenTexture,
    Math.round(x * 32),
    Math.round(y * 32),
    32,
    32,
  )
}



//---------------------------------------
// Actions
//

const makeScreen = (type, x, y, content, name = null) => {
  return {
    name: name ?? type,
    type,
    content,
    page: 0,
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

export const createDocument = (id, x, y, text, name) => {
  const screen = {
    ...makeScreen(TYPE.DOCUMENT, x, y, text, name),
  }
  console.log(`New screen:`, screen)
  Interactable.create('screen', id, x, y, screen)
  return screen
}

export const createBook = (id, x, y, url, name) => {
  const screen = {
    ...makeScreen(TYPE.PDF_BOOK, x, y, url, name),
  }
  console.log(`New screen:`, screen)
  Interactable.create('screen', id, x, y, screen)
  return screen
}

export const updateScreen = (id, values) => {
  const store = getRemoteStore()
  let screen = store.getDocument('screen', id)
  if (screen !== null) {
    store.setDocument('screen', id, {
      ...screen, ...values
    })
  }
}

