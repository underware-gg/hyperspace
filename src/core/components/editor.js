import { nanoid } from 'nanoid'
import * as THREE from 'three'
import RoomCollection from '@/core/interfaces/RoomCollection'
import { getFilenameFromUrl } from '@/core/utils'

const normalMatrix = new THREE.Matrix3() // create once and reuse
const worldNormal = new THREE.Vector3() // create once and reuse

class Editor extends RoomCollection {
  constructor(room) {
    super(room, 'editor')
  }

  init2d(canvas, agentId) {
    if (!canvas) {
      return
    }

    const _handleEditorMove = (tile, interacting) => {
      this.remoteStore.setDocument('editor', agentId, {
        position: tile ?? {},
        interacting: interacting && tile != null,
      })
    }

    const handleMouseMove = (e) => _handleEditorMove(this.getMouseTilePosition(e, canvas), true)
    const handleMouseOver = (e) => _handleEditorMove(this.getMouseTilePosition(e, canvas), true)
    const handleMouseOut = (e) => _handleEditorMove({ x: 0, y: 0 }, false)

    this.remoteStore.on({ type: 'editor', event: 'update' }, (id, editor) => {
      // id is the agent id.
    })

    this.actions.addActionDownListener('createPortal', (options = {}) => {
      const { slug, tile } = options
      if (!slug) {
        console.warn(`createPortal: missing slug`)
        return
      }

      if (!this.Player.canPlaceOverPlayer(agentId)) {
        return
      }

      const { x, y } = this.getCreateTileRotation(agentId)
      this.Portal.createPortal(slug, tile, x, y)
    })

    this.actions.addActionDownListener('createTrigger', (options = {}) => {
      const trigger = {
        name: options?.name ?? 'Trigger',
        state: options?.state ?? 0,
        data: JSON.stringify(options?.data ?? []),
      }

      if (!this.Player.canPlaceOverPlayer(agentId)) {
        return
      }

      const { x, y } = this.getCreateTileRotation(agentId)
      this.Trigger.createAtPosition(nanoid(), trigger, x, y)
    })

    this.actions.addActionDownListener('createScreen', () => {
      if (!this.Player.canPlaceOverPlayer(agentId)) {
        return
      }

      const name = window.prompt('Screen name', '')
      if (name == null || name == '') {
        return
      }

      const screenId = nanoid()
      const text = `# Screen: ${name}\n\nThis is a MarkDown shared document\n\nid: ${screenId}`

      const { x, y, rot } = this.getCreateTileRotation(agentId)
      this.Screen.createDocument(screenId, x, y, rot, text, name)
    })

    this.actions.addActionDownListener('createBook', () => {
      if (!this.Player.canPlaceOverPlayer(agentId)) {
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
      const { x, y, rot } = this.getCreateTileRotation(agentId)
      this.Screen.createBook(screenId, x, y, rot, url, name)
    })

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseover', handleMouseOver)
    canvas.addEventListener('mouseout', handleMouseOut)
  }

  init3d(canvas, agentId) {
    if(!canvas) {
      return
    }

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
        this.remoteStore.setDocument('editor', agentId, {
          position: {
            x: Math.floor(pickingLocation.x),
            y: Math.floor(-pickingLocation.y - 1),
          },
          interacting: this.canEdit('world'),
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

  doPicking() {
    const pointerMesh = this.localStore.getDocument('raycastPointer', 'raycastPointer')
    const rayTargets = this.localStore.getDocument('gridContainer', 'gridContainer')
    const pointer = this.localStore.getDocument('pointer', 'pointer')
    const camera = this.localStore.getDocument('camera', 'camera')

    if (pointerMesh === null || rayTargets === null || pointer === null || camera === null) {
      return
    }

    const raycaster = new THREE.Raycaster()

    const pickingLocation = new THREE.Vector3
    if (this.localStore.getDocument('pickingLocation', 'pickingLocation') === null) {
      this.localStore.setDocument('pickingLocation', 'pickingLocation', pickingLocation)
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
    if (editor === null) return

    const { position: { x, y }, interacting } = editor

    const pointerMesh = this.localStore.getDocument('raycastPointer', 'raycastPointer')
    
    if (pointerMesh != null) {
      pointerMesh.visible = interacting
    }

    if (!interacting) {
      return
    }

    if (!this.canEdit('world')) {
      return
    }

    if (this.actions.getActionState('1')) {
      this.Map.updateTile('world', x, y, 0)
    }

    if (this.actions.getActionState('2')) {
      this.Map.updateTile('world', x, y, 1)
    }

    if (this.actions.getActionState('3')) {
      this.Map.updateTile('world', x, y, 2)
    }

    if (this.actions.getActionState('4')) {
      this.Map.updateTile('world', x, y, 3)
    }

    if (this.actions.getActionState('5')) {
      this.Map.updateTile('world', x, y, 4)
    }

    if (this.actions.getActionState('6')) {
      this.Map.updateTile('world', x, y, 5)
    }

    if (this.actions.getActionState('7')) {
      this.Map.updateTile('world', x, y, 6)
    }

    if (this.actions.getActionState('8')) {
      this.Map.updateTile('world', x, y, 7)
    }

    if (this.actions.getActionState('9')) {
      this.Map.updateTile('world', x, y, 8)
    }

    if (this.actions.getActionState('0')) {
      this.Map.updateTile('world', x, y, 9)
    }

    if (this.actions.getActionState('-')) {
      this.Map.updateTile('world', x, y, null)
    }
  }

  render2d(id, context) {
    if (!context) return

    // do not draw cursor for if I cant edit
    if (!this.canEdit('world')) {
      return
    }

    const editor = this.remoteStore.getDocument('editor', id)
    if (editor === null) return

    const { position: { x, y }, interacting } = editor
    if (!interacting) return

    if(!this.Map.validateTile(x, y)) {
      return
    }

    // do not draw cursor for remote users if room is not editable
    const isRemoteUser = (this.agentId !== id)
    if (isRemoteUser && !this.canEdit('world', null)) {
      return
    }

    context.lineWidth = 0.1
    context.strokeStyle = isRemoteUser ? 'red' : 'blue'

    context.strokeRect(
      this.Map.viewport.tiles[y][x].start.x,
      this.Map.viewport.tiles[y][x].start.y,
      1,
      1,
    )
  }

  getMouseTilePosition(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / canvas.scrollWidth * canvas.width)
    const y = Math.floor((e.clientY - rect.top) / canvas.scrollHeight * canvas.height)
    return this.Map.canvasPositionToTile(x, y);
  }

  getCreateTileRotation(id) {
    const editor = this.remoteStore.getDocument('editor', id)

    let { x, y, rot } = this.Player.getPlayerTileRotation(id)

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
