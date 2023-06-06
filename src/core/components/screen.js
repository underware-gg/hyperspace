import * as THREE from 'three'
import RoomCollection from '@/core/interfaces/RoomCollection'
import { HTMLMesh } from '@/core/rendering/HTMLMesh'
import { getTextureImageByName } from '@/core/textures'
import { floors } from '@/core/components/map'

export const TYPE = {
  DOCUMENT: 'document',
  PDF_BOOK: 'pdf_book',
}

class Screen extends RoomCollection {
  constructor(room) {
    super(room, 'screen')

    const scene = this.localStore.getDocument('scene', 'scene')

    if (scene == null) {
      return // no 3d render
    }

    const screenMeshes = new THREE.Object3D()
    scene.add(screenMeshes)
    this.localStore.setDocument('screen-meshes', 'screen-meshes', screenMeshes)

    const _createScreen = (screenId, screen) => {
      const screenMeshes = this.localStore.getDocument('screen-meshes', 'screen-meshes')
      if (screenMeshes === null) return

      const { position: { x, y }, rotation: { y: rot } } = screen

      const aspect = process.env.RENDER_WIDTH / process.env.RENDER_HEIGHT
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

      this.localStore.setDocument('screen-mesh', screenId, screenMesh)

      _updatePermission(screenId)
    }

    const _deleteScreen = (screenId) => {
      const screenMeshes = this.localStore.getDocument('screen-meshes', 'screen-meshes')
      if (screenMeshes === null) return

      const screenMesh = this.localStore.getDocument('screen-mesh', screenId)
      if (screenMesh === null) return

      this.localStore.setDocument('screen-mesh', screenId, null)
      screenMeshes.remove(screenMesh)
    }

    const _updatePermission = (screenId) => {
      const screenMeshes = this.localStore.getDocument('screen-meshes', 'screen-meshes')
      if (screenMeshes === null) return

      const screenMesh = this.localStore.getDocument('screen-mesh', screenId)
      if (screenMesh === null) return

      screenMesh.visible = this.canView(screenId)
    }

    this.remoteStore.on({ type: 'screen', event: 'create' }, (screenId, screen) => {
      _createScreen(screenId, screen)
    })

    this.remoteStore.on({ type: 'screen', event: 'delete' }, (screenId) => {
      _deleteScreen(screenId)
    })

    this.remoteStore.on({ type: 'map2', event: 'update' }, (mapId, map) => {
      const screenIds = this.remoteStore.getIds('screen')

      // update all screens because we don't know what changed
      for (const screenId of screenIds) {
        const screen = this.remoteStore.getDocument('screen', screenId)
        if (screen === null) continue

        const { position: { x, y }, rotation: { y: rot } } = screen

        const tile = this.Map.getTile('world', x, y)
        if (tile === null) continue

        const currentFloorHeight = floors[tile]

        const screenMesh = this.localStore.getDocument('screen-mesh', screenId)
        if (screenMesh === null) continue

        screenMesh.position.set(
          (Math.floor(x)) + 0.5,
          (-Math.floor(y)) - 0.05,
          currentFloorHeight + 1.2,
        )
      }
    })

    this.remoteStore.on({ type: 'permission', event: 'update' }, (screenId, permission) => {
      _updatePermission(screenId)
    })

    this.sessionStore.on({ type: 'player', event: 'update' }, (agentId, player) => {
      if (agentId == this.agentId) {
       this.doScreenPicking();
      }
    })

    this.actions.addActionDownListener('syncScreens', async () => {
      const screenIds = this.remoteStore.getIds('screen')
      for (const screenId of screenIds) {
        // delete if already exists (component could have been remounted)
        _deleteScreen(screenId)

        const screen = this.remoteStore.getDocument('screen', screenId)
        _createScreen(screenId, screen)
      }
    })
  }

  doScreenPicking() {
    const screenMeshes = this.localStore.getDocument('screen-meshes', 'screen-meshes')
    const camera = this.localStore.getDocument('camera', 'camera')

    if (camera === null || screenMeshes === null) {
      return
    }

    screenMeshes.updateMatrixWorld();

    const pointer = new THREE.Vector2() // 0,0 is center of camera

    const raycaster = new THREE.Raycaster()

    raycaster.setFromCamera(pointer, camera)

    let newScreenId = null

    const intersects = raycaster.intersectObjects(screenMeshes.children)
    if (intersects.length > 0 && intersects[0].distance <= 2.5) {
      const screen = intersects[0].object
      newScreenId = screen.name
    }

    if (newScreenId != this.localStore.getDocument('screens', 'facing-3d')) {
      // console.log(`Intersect screen:`, intersects.length, newScreenId)
      this.localStore.setDocument('screens', 'facing-3d', newScreenId)
    }
  }

  render2d(id, context, agentId) {
    const screen = this.remoteStore.getDocument('screen', id)

    if (screen === null) {
      return
    }

    const { position: { x, y } } = screen

    let textureName = screen.type
    let textureNameOver = screen.type
    if (agentId && id == this.Player.getScreenOverPlayer(agentId)) {
      textureNameOver += `_over`
    }

    this.Map.drawTextureAtTile(context, x, y, textureNameOver, textureName)
  }



  //---------------------------------------
  // Actions
  //

  makeScreen(type, x, y, rot, content, name = null) {
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

  createDocument(id, x, y, rot, text, name) {
    const screen = this.makeScreen(TYPE.DOCUMENT, x, y, rot, text, name)
    console.log(`New screen:`, screen)
    return this.upsert(id, screen, true)
  }

  createBook(id, x, y, rot, url, name) {
    const screen = this.makeScreen(TYPE.PDF_BOOK, x, y, rot, url, name)
    console.log(`New Book:`, screen)
    return this.upsert(id, screen, true)
  }

  updateScreen(id, values) {
    this.upsert(id, values, true)
  }

}

export default Screen
