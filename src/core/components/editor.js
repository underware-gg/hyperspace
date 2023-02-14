import * as THREE from 'three'
import { nanoid } from 'nanoid'
import * as Room from '@/core/networking'
import * as Map from '@/core/components/map'
import * as Portal from '@/core/components/portal'
import * as Screen from '@/core/components/screen'
import * as Permission from '@/core/components/permission'
import { getActionState, addActionDownListener } from '@/core/controller'
import { getLocalStore, getRemoteStore } from '@/core/singleton'
import { canPlaceOverPlayer, getPortalOverPlayer } from '@/core/components/player'
import { MAP_SCALE_X, MAP_SCALE_Y } from '@/core/components/map'
import { getPlayerTile } from '@/core/components/player'
import { roundToNearest, getFilenameFromUrl } from '@/core/utils'

export const getMouseCanvasPosition = (e, canvas) => {
  const rect = canvas.getBoundingClientRect()
  const x = (e.clientX - rect.left) / canvas.scrollWidth * canvas.width
  const y = (e.clientY - rect.top) / canvas.scrollHeight * canvas.height
  return {
    x: Math.floor(x),
    y: Math.floor(y),
  }
}

export const getMouseTilePosition = (e, canvas) => {
  const { x, y } = getMouseCanvasPosition(e, canvas);
  return {
    x: Math.floor(x / MAP_SCALE_X / 32),
    y: Math.floor(y / MAP_SCALE_Y / 32),
  }
}

export const getCreateTile = (id) => {
  const store = getRemoteStore()
  const editor = store.getDocument('editor', id)
  if (editor) {
    const { interacting, position: { x, y } } = editor
    if (interacting) {
      return {
        tileX: x,
        tileY: y,
      }
    }
  }
  return getPlayerTile(id)
}

export const init = (canvas, id) => {
  const localStore = getLocalStore()
  const remoteStore = getRemoteStore()

  const _handleEditorMove = (position, interacting) => {
    const editor = remoteStore.getDocument('editor', id)

    if (editor != null) {
      const { position: { x, y } } = editor
      if (position.x == x && position.y == y) {
        return
      }
    }

    remoteStore.setDocument('editor', id, {
      position,
      interacting,
    })
  }

  const handleMouseMove = (e) => _handleEditorMove(getMouseTilePosition(e, canvas), true)
  const handleMouseOver = (e) => _handleEditorMove(getMouseTilePosition(e, canvas), true)
  const handleMouseOut = (e) => _handleEditorMove({ x: 0, y: 0 }, false)

  remoteStore.on({ type: 'editor', event: 'update' }, (id, editor) => {
    // id is the agent id.
  })

  addActionDownListener('createPortal', () => {
    if (!canPlaceOverPlayer(id)) {
      return
    }

    const slug = window.prompt('The portal leads to...', 'test')
    if (slug === null) {
      return
    }

    const { tileX, tileY } = getCreateTile(id)
    Portal.create(nanoid(), tileX, tileY, slug)
  })

  addActionDownListener('createScreen', () => {
    if (!canPlaceOverPlayer(id)) {
      return
    }

    const name = window.prompt('Screen name', '')
    if (name == null || name == '') {
      return
    }

    const screenId = nanoid()
    const text = `# Screen: ${name}\n\nThis is a MarkDown shared document\n\nid: ${screenId}`

    const { tileX, tileY } = getCreateTile(id)
    Screen.createDocument(screenId, tileX, tileY, text, name)
  })

  addActionDownListener('createBook', () => {
    if (!canPlaceOverPlayer(id)) {
      return
    }

    // const url = window.prompt('PDF or Image URL:', 'https://bitcoin.org/bitcoin.pdf')
    const url = window.prompt('PDF or Image URL:', '/books/funDAOmentals.pdf')
    if (url == null || url == '') {
      return
    }
    const name = getFilenameFromUrl(url) ?? 'New Book'
    console.log(url, name)

    const screenId = nanoid()
    const { tileX, tileY } = getCreateTile(id)
    Screen.createBook(screenId, tileX, tileY, url, name)
  })

  canvas.addEventListener('mousemove', handleMouseMove)
  canvas.addEventListener('mouseover', handleMouseOver)
  canvas.addEventListener('mouseout', handleMouseOut)
}

export const init3d = (canvas, id) => {
  const localStore = getLocalStore()
  const remoteStore = getRemoteStore()

  const scene = localStore.getDocument('scene', 'scene')

  const selectionGeometry = new THREE.BoxGeometry(1.2, 1.2, 2.3)

  const selectionMat = new THREE.MeshBasicMaterial({
    color: 0x0000FF,
    transparent: true,
    opacity: 0.23,
  })
  const selectionMesh = new THREE.Mesh(selectionGeometry, selectionMat)

  scene.add(selectionMesh)

  localStore.setDocument('raycastPointer', 'raycastPointer', selectionMesh)

  const handleMouseMove = (e) => {
    const pointer = new THREE.Vector2()
    const rect = canvas.getBoundingClientRect()

    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = - ((e.clientY - rect.top) / rect.height) * 2 + 1
    localStore.setDocument('pointer', 'pointer', pointer)

    doPicking()

    const pickingLocation = localStore.getDocument('pickingLocation', 'pickingLocation')

    if (pickingLocation !== null) {
      remoteStore.setDocument('editor', id, {
        position: {
          x: Math.floor(pickingLocation.x),
          y: Math.floor(-pickingLocation.y - 1),
        },
        interacting: true,
      })
    }
  }

  const handleMouseOver = (e) => {
    const pointer = new THREE.Vector2()
    const rect = canvas.getBoundingClientRect()

    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = - ((e.clientY - rect.top) / rect.height) * 2 + 1
    localStore.setDocument('pointer', 'pointer', pointer)

    doPicking()

    const pickingLocation = localStore.getDocument('pickingLocation', 'pickingLocation')

    if (pickingLocation !== null) {
      remoteStore.setDocument('editor', id, {
        position: {
          x: Math.floor(pickingLocation.x),
          y: Math.floor(-pickingLocation.y - 1),
        },
        interacting: true,
      })
    }
  }

  const handleMouseOut = (e) => {
    const pointer = new THREE.Vector2()
    const rect = canvas.getBoundingClientRect()

    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = - ((e.clientY - rect.top) / rect.height) * 2 + 1
    localStore.setDocument('pointer', 'pointer', pointer)

    doPicking()

    const pickingLocation = localStore.getDocument('pickingLocation', 'pickingLocation')

    if (pickingLocation !== null) {
      remoteStore.setDocument('editor', id, {
        position: {
          x: Math.floor(pickingLocation.x),
          y: Math.floor(-pickingLocation.y - 1),
        },
        interacting: false,
      })
    }
  }

  canvas.addEventListener('mousemove', handleMouseMove)
  canvas.addEventListener('mouseover', handleMouseOver)
  canvas.addEventListener('mouseout', handleMouseOut)
}

const normalMatrix = new THREE.Matrix3() // create once and reuse
const worldNormal = new THREE.Vector3() // create once and reuse

const doPicking = () => {
  const localStore = getLocalStore()

  const pointerMesh = localStore.getDocument('raycastPointer', 'raycastPointer')
  const rayTargets = localStore.getDocument('gridContainer', 'gridContainer')
  const pointer = localStore.getDocument('pointer', 'pointer')

  const camera = localStore.getDocument('camera', 'camera')
  const raycaster = new THREE.Raycaster()

  const pickingLocation = new THREE.Vector3
  if (localStore.getDocument('pickingLocation', 'pickingLocation') === null) {
    localStore.setDocument('pickingLocation', 'pickingLocation', pickingLocation)
  }

  if (pointerMesh === null || rayTargets === null || pointer === null || camera === null) {
    return
  }

  raycaster.setFromCamera(pointer, camera)

  const intersects = raycaster.intersectObjects(rayTargets.children)
  if (intersects.length > 0) {
    intersects[0].object.parent.getWorldPosition(pickingLocation)

    normalMatrix.getNormalMatrix(intersects[0].object.matrixWorld);
    worldNormal.copy(intersects[0].face.normal).applyMatrix3(normalMatrix).normalize()

    if (intersects[0].point.z < 0.1) {
      pickingLocation.x = intersects[0].point.x + worldNormal.x / 2
      pickingLocation.y = (intersects[0].point.y + worldNormal.y / 2) - 1
    } else {
      pickingLocation.x = intersects[0].point.x - worldNormal.x / 2
      pickingLocation.y = (intersects[0].point.y - worldNormal.y / 2) - 1
    }

    localStore.setDocument('pickingLocation', 'pickingLocation', pickingLocation)

    pointerMesh.position.x = Math.floor(pickingLocation.x) + 0.5
    pointerMesh.position.y = Math.floor(pickingLocation.y) + 1.5
    pointerMesh.position.z = .9
  }
}

export const update = (id, dt) => {
  const store = getRemoteStore()

  const editor = store.getDocument('editor', id)

  if (editor === null) {
    return
  }

  const { position: { x, y }, interacting } = editor

  const localStore = getLocalStore()

  const pointerMesh = localStore.getDocument('raycastPointer', 'raycastPointer')
  pointerMesh.visible = interacting

  if (!interacting) {
    return
  }

  if (!Permission.canEdit('world')) {
    return
  }

  if (getActionState('1')) {
    Map.update('world', x, y, 0)
  }

  if (getActionState('2')) {
    Map.update('world', x, y, 1)
  }

  if (getActionState('3')) {
    Map.update('world', x, y, 2)
  }

  if (getActionState('4')) {
    Map.update('world', x, y, 3)
  }

  if (getActionState('5')) {
    Map.update('world', x, y, 4)
  }

  if (getActionState('6')) {
    Map.update('world', x, y, 5)
  }

  if (getActionState('7')) {
    Map.update('world', x, y, 6)
  }

  if (getActionState('8')) {
    Map.update('world', x, y, 7)
  }

  if (getActionState('9')) {
    Map.update('world', x, y, 8)
  }

  if (getActionState('0')) {
    Map.update('world', x, y, 9)
  }
}

export const render2d = (id, context) => {
  const room = Room.get()
  const store = getRemoteStore()
  const editor = store.getDocument('editor', id)

  if (editor === null) {
    return
  }

  const { position: { x, y }, interacting } = editor

  if (!interacting) {
    return
  }

  // do not draw cursor for if I cant edit
  if (!Permission.canEdit('world')) {
    return
  }

  // do not draw cursor for remote users if room is not editable
  const isRemoteUser = (room.agentId !== id)
  if (isRemoteUser && !Permission.canEdit('world', null)) {
    return
  }

  context.lineWidth = 3
  context.strokeStyle = isRemoteUser ? 'red' : 'blue'

  context.strokeRect(
    roundToNearest(x * 32 - 16, 32),
    roundToNearest(y * 32 - 16, 32),
    32,
    32,
  )
}
