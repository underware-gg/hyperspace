import * as THREE from 'three'
import * as ClientRoom from '@/core/networking'
import * as Interactable from '@/core/components/interactable'
import * as Permission from '@/core/components/permission'
import { HTMLMesh } from '@/core/rendering/HTMLMesh'
import { getTextureImageByName } from '@/core/textures'
import { getLocalStore, getRemoteStore } from '@/core/singleton'
import { getTile, floors } from '@/core/components/map'
import { addActionDownListener } from '@/core/controller'
import { getScreenOverPlayer } from '@/core/components/player'

export const TYPE = {
  DOCUMENT: 'document',
  PDF_BOOK: 'pdf_book',
}

export const init = () => {
  const room = ClientRoom.get()
  const localStore = getLocalStore()
  const remoteStore = getRemoteStore()

  const scene = localStore.getDocument('scene', 'scene')
  if (scene) {
    const screenMeshes = new THREE.Object3D()
    scene.add(screenMeshes)
    localStore.setDocument('screen-meshes', 'screen-meshes', screenMeshes)
  }

  const _createScreen = (screenId, screen) => {
    const screenMeshes = localStore.getDocument('screen-meshes', 'screen-meshes')
    if (screenMeshes === null) return

    const { position: { x, y }, rotation: { y: rot } } = screen

    const aspect = process.env.BASE_WIDTH / process.env.BASE_HEIGHT
    const cellHeight = 1.5 //1.2
    const cellWidth = cellHeight * aspect

    const screenElement = document.getElementById(screenId)
    if (screenElement == null) {
      // console.warn(`Screen component [${screenId}] not fond!`)
      return
    }
    // console.log(`HTML Screen [${screenId}]:`, screenElement)

    const screenMesh = new HTMLMesh(screenElement, cellWidth, cellHeight, true)

    screenMesh.name = screenId

    screenMesh.position.set(Math.floor(x) + 0.5, -Math.floor(y) - 0.5, .75)
    screenMesh.rotation.set(Math.PI / 2, rot, 0)

    screenMeshes.add(screenMesh)

    localStore.setDocument('screen-mesh', screenId, screenMesh)

    _updatePermission(screenId)
  }

  const _deleteScreen = (screenId) => {
    const screenMeshes = localStore.getDocument('screen-meshes', 'screen-meshes')
    if (screenMeshes === null) return

    const screenMesh = localStore.getDocument('screen-mesh', screenId)
    if (screenMesh === null) return

    localStore.setDocument('screen-mesh', screenId, null)
    screenMeshes.remove(screenMesh)
  }

  const _updatePermission = (screenId) => {
    const screenMeshes = localStore.getDocument('screen-meshes', 'screen-meshes')
    if (screenMeshes === null) return

    const screenMesh = localStore.getDocument('screen-mesh', screenId)
    if (screenMesh === null) return

    screenMesh.visible = Permission.canView(screenId)
  }

  remoteStore.on({ type: 'screen', event: 'create' }, (screenId, screen) => {
    _createScreen(screenId, screen)
  })

  remoteStore.on({ type: 'screen', event: 'delete' }, (screenId) => {
    _deleteScreen(screenId)
  })

  remoteStore.on({ type: 'map', event: 'update' }, (mapId, map) => {
    const screenIds = remoteStore.getIds('screen')

    // update all screens because we don't know what changed
    for (const screenId of screenIds) {
      const screen = remoteStore.getDocument('screen', screenId)
      if (screen === null) continue

      const { position: { x, y }, rotation: { y: rot } } = screen

      const tile = getTile('world', x, y)
      if (tile === null) continue

      const currentFloorHeight = floors[tile]

      const screenMesh = localStore.getDocument('screen-mesh', screenId)
      if (screenMesh === null) continue

      screenMesh.position.set(
        (Math.floor(x)) + 0.5,
        (-Math.floor(y)) - 0.05,
        currentFloorHeight + 1.2,
      )
    }
  })

  remoteStore.on({ type: 'permission', event: 'update' }, (screenId, permission) => {
    _updatePermission(screenId)
  })

  remoteStore.on({ type: 'player', event: 'update' }, (agentId, player) => {
    if(agentId == room.agentId) {
      doScreenPicking();
    }
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

const doScreenPicking = () => {
  const localStore = getLocalStore()

  const screenMeshes = localStore.getDocument('screen-meshes', 'screen-meshes')
  const camera = localStore.getDocument('camera', 'camera')

  if (camera === null || screenMeshes === null) {
    return
  }

  screenMeshes.updateMatrixWorld();

  const pointer = new THREE.Vector2() // 0,0 is center of camera

  const raycaster = new THREE.Raycaster()

  raycaster.setFromCamera(pointer, camera)

  const newScreenId = null
  
  const intersects = raycaster.intersectObjects(screenMeshes.children)
  if (intersects.length > 0 && intersects[0].distance <= 2.5) {
    const screen = intersects[0].object
    newScreenId = screen.name
  }

  if (newScreenId != localStore.getDocument('screens', 'facing-3d')) {
    // console.log(`Intersect screen:`, intersects.length, newScreenId)
    localStore.setDocument('screens', 'facing-3d', newScreenId)
  }
}


export const exists = (id) => {
  return Interactable.exists('screen', id)
}

export const remove = (id) => {
  if (!Permission.canEdit(id)) {
    console.warn(`No permission to delete Screen [${id}]`)
    return
  }
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
  let texture = getTextureImageByName(textureNameOver, textureName)

  if (texture == null) {
    console.warn(`Screen texture not found`, textureNameOver, textureName)
    return
  }

  context.drawImage(
    texture,
    Math.round(x * 32),
    Math.round(y * 32),
    32,
    32,
  )
}



//---------------------------------------
// Actions
//

const makeScreen = (type, x, y, rot, content, name = null) => {
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
      y: rot,
      z: 0,
    },
  }
}

export const createDocument = (id, x, y, rot, text, name) => {
  const screen = {
    ...makeScreen(TYPE.DOCUMENT, x, y, rot, text, name),
  }
  console.log(`New screen:`, screen)
  const store = getRemoteStore()
  store.setDocument('screen', id, screen)
  return screen
}

export const createBook = (id, x, y, rot, url, name) => {
  const screen = {
    ...makeScreen(TYPE.PDF_BOOK, x, y, rot, url, name),
  }
  console.log(`New Book:`, screen)
  const store = getRemoteStore()
  store.setDocument('screen', id, screen)
  return screen
}

export const updateScreen = (id, values) => {
  const store = getRemoteStore()
  let screen = store.getDocument('screen', id)
  if (screen == null) return

  if (!Permission.canEdit(id)) {
    console.warn(`No permission to update Screen [${id}] [${screen.name}]`)
    return
  }

  store.setDocument('screen', id, {
    ...screen, ...values
  })
}

