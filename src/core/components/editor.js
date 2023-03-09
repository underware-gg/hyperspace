import { nanoid } from 'nanoid'
import * as THREE from 'three'
import RoomMate from '@/core/interfaces/RoomMate'
import * as Map from '@/core/components/map'
import * as Portal from '@/core/components/portal'
import * as Trigger from '@/core/components/trigger'
import * as Screen from '@/core/components/screen'
import * as Permission from '@/core/components/permission'
import { getActionState, addActionDownListener } from '@/core/controller'
import { canPlaceOverPlayer } from '@/core/components/player'
import { getMapScale } from '@/core/components/map'
import { getPlayerTileRotation } from '@/core/components/player'
import { roundToNearest, getFilenameFromUrl } from '@/core/utils'

class Editor extends RoomMate {
  constructor(room) {
    super(room)
  }

  init(canvas, id) {
    const _handleEditorMove = (position, interacting) => {
      const editor = this.remoteStore.getDocument('editor', id)

      if (editor != null) {
        const { position: { x, y } } = editor
        if (position.x == x && position.y == y) {
          return
        }
      }

      this.remoteStore.setDocument('editor', id, {
        position,
        interacting,
      })
    }

    const handleMouseMove = (e) => _handleEditorMove(this.getMouseTilePosition(e, canvas, this.remoteStore), true)
    const handleMouseOver = (e) => _handleEditorMove(this.getMouseTilePosition(e, canvas, this.remoteStore), true)
    const handleMouseOut = (e) => _handleEditorMove({ x: 0, y: 0 }, false)

    this.remoteStore.on({ type: 'editor', event: 'update' }, (id, editor) => {
      // id is the agent id.
    })

    addActionDownListener('createPortal', (options = {}) => {
      const { slug, tile } = options
      if (!slug) {
        console.warn(`createPortal: missing slug`)
        return
      }

      if (!canPlaceOverPlayer(id)) {
        return
      }

      const { x, y } = this.getCreateTileRotation(id)
      console.log(`create_portal`, id, x, y, slug, tile)
      Portal.create(nanoid(), x, y, slug, tile)
    })

    addActionDownListener('createTrigger', (options = {}) => {
      const trigger = {
        name: options?.name ?? 'Trigger',
        state: options?.state ?? 0,
        data: JSON.stringify(options?.data ?? []),
      }

      if (!canPlaceOverPlayer(id)) {
        return
      }

      const { x, y } = this.getCreateTileRotation(id)
      Trigger.create(nanoid(), x, y, trigger)
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

      const { x, y, rot } = this.getCreateTileRotation(id)
      Screen.createDocument(screenId, x, y, rot, text, name)
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
      const { x, y, rot } = this.getCreateTileRotation(id)
      Screen.createBook(screenId, x, y, rot, url, name)
    })

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseover', handleMouseOver)
    canvas.addEventListener('mouseout', handleMouseOut)
  }

  init3d(canvas, id) {
    const scene = this.localStore.getDocument('scene', 'scene')

    const selectionGeometry = new THREE.BoxGeometry(1.2, 1.2, 2.3)

    const selectionMat = new THREE.MeshBasicMaterial({
      color: 0x0000FF,
      transparent: true,
      opacity: 0.23,
      depthWrite: false,
    })
    const selectionMesh = new THREE.Mesh(selectionGeometry, selectionMat)

    scene.add(selectionMesh)

    this.localStore.setDocument('raycastPointer', 'raycastPointer', selectionMesh)

    const updatePointerVector = (e) => {
      const pointer = new THREE.Vector2()
      const rect = canvas.getBoundingClientRect()
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = - ((e.clientY - rect.top) / rect.height) * 2 + 1
      this.localStore.setDocument('pointer', 'pointer', pointer)
    }

    const _updatePickingLocation = (e) => {
      updatePointerVector(e)

      this.doPicking()

      const pickingLocation = this.localStore.getDocument('pickingLocation', 'pickingLocation')

      if (pickingLocation !== null) {
        this.remoteStore.setDocument('editor', id, {
          position: {
            x: Math.floor(pickingLocation.x),
            y: Math.floor(-pickingLocation.y - 1),
          },
          interacting: Permission.canEdit('world'),
        })
      }
    }

    const handleMouseMove = (e) => {
      _updatePickingLocation(e)
    }

    const handleMouseOver = (e) => {
      _updatePickingLocation(e)
    }

    const handleMouseOut = (e) => {
      _updatePickingLocation(e)
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseover', handleMouseOver)
    canvas.addEventListener('mouseout', handleMouseOut)
  }

  static normalMatrix = new THREE.Matrix3() // create once and reuse
  static worldNormal = new THREE.Vector3() // create once and reuse

  doPicking() {
    const pointerMesh = this.localStore.getDocument('raycastPointer', 'raycastPointer')
    const rayTargets = this.localStore.getDocument('gridContainer', 'gridContainer')
    const pointer = this.localStore.getDocument('pointer', 'pointer')

    const camera = this.localStore.getDocument('camera', 'camera')
    const raycaster = new THREE.Raycaster()

    const pickingLocation = new THREE.Vector3
    if (this.localStore.getDocument('pickingLocation', 'pickingLocation') === null) {
      this.localStore.setDocument('pickingLocation', 'pickingLocation', pickingLocation)
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

      this.localStore.setDocument('pickingLocation', 'pickingLocation', pickingLocation)

      pointerMesh.position.x = Math.floor(pickingLocation.x) + 0.5
      pointerMesh.position.y = Math.floor(pickingLocation.y) + 1.5
      pointerMesh.position.z = .9
    }
  }

  update(id, dt) {
    const editor = this.remoteStore.getDocument('editor', id)

    if (editor === null) {
      return
    }

    const { position: { x, y }, interacting } = editor

    const pointerMesh = this.localStore.getDocument('raycastPointer', 'raycastPointer')
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

  render2d(id, context) {
    const editor = this.remoteStore.getDocument('editor', id)

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
    const isRemoteUser = (this.agentId !== id)
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

  getMouseCanvasPosition(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / canvas.scrollWidth * canvas.width
    const y = (e.clientY - rect.top) / canvas.scrollHeight * canvas.height
    return {
      x: Math.floor(x),
      y: Math.floor(y),
    }
  }

  getMouseTilePosition(e, canvas, store) {
    const { x, y } = this.getMouseCanvasPosition(e, canvas);
    const mapScale = getMapScale(store)
    return {
      x: Math.floor(x / mapScale.x / 32),
      y: Math.floor(y / mapScale.y / 32),
    }
  }

  getCreateTileRotation(id) {
    const editor = this.remoteStore.getDocument('editor', id)

    let { x, y, rot } = getPlayerTileRotation(id)

    if (editor) {
      const { interacting, position } = editor
      if (interacting) {
        x = position.x
        y = position.y
      }
    }
    return { x, y, rot }
  }

}

export default Editor
