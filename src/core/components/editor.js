import { nanoid } from 'nanoid'
import * as THREE from 'three'
import RoomCollection from '@/core/interfaces/RoomCollection'
import { boxGeometryToLineSegmentsGeometry } from '@/core/rendering/mesh-utils'
import { getFilenameFromUrl } from '@/core/utils'
import { TYPE } from '@/core/components/screen'

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
      this.sessionStore.setDocument('editor', agentId, {
        position: tile ?? {},
        interacting: interacting && tile != null,
      })
    }

    const handleMouseMove = (e) => _handleEditorMove(this.getMouseTilePosition(e, canvas), true)
    const handleMouseOver = (e) => _handleEditorMove(this.getMouseTilePosition(e, canvas), true)
    const handleMouseOut = (e) => _handleEditorMove({ x: 0, y: 0 }, false)

    this.sessionStore.on({ type: 'editor', event: 'update' }, (id, editor) => {
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

    this.actions.addActionDownListener('createScreen', (options = {}) => {
      if (!this.Player.canPlaceOverPlayer(agentId)) {
        return
      }

      const screenId = nanoid()
      const type = options.type ?? TYPE.DOCUMENT
      const name = options.name ?? type
      const content = options.content ??
        type == TYPE.DOCUMENT ? `# Screen: ${name}\n\nThis is a MarkDown shared document\n\nid: ${screenId}`
        : type == TYPE.METADATA ? `# Metadata`
          : '???'

      const { x, y, rot } = this.getCreateTileRotation(agentId)
      this.Screen.createScreen(screenId, type, x, y, rot, content, name)
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
    if (!canvas) {
      return
    }

    const scene = this.localStore.getDocument('scene', 'scene')

    const pointerMesh = new THREE.Object3D()
    {
      const pointerGeometry = new THREE.BoxGeometry(1.2, 1.2, 2.3)
      const pointerShadeMat = new THREE.MeshBasicMaterial({
        color: 'blue',
        transparent: true,
        opacity: 0.23,
        depthWrite: false,
      })
      const pointerShade = new THREE.Mesh(pointerGeometry, pointerShadeMat)
      pointerMesh.add(pointerShade)

      const pointerWireMat = new THREE.LineBasicMaterial({
        color: 'white',
        linewidth: 3, // does not work on most browsers
      })
      const pointerWireGeometry = boxGeometryToLineSegmentsGeometry(pointerGeometry)
      const pointerWire = new THREE.LineSegments(pointerWireGeometry, pointerWireMat)
      pointerMesh.add(pointerWire)
    }

    scene.add(pointerMesh)

    this.localStore.setDocument('pointerMesh', 'pointerMesh', pointerMesh)

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
      if (!pickingLocation) return

      const tile = {
        x: Math.floor(pickingLocation.x),
        y: Math.floor(-pickingLocation.y - 1),
      }
      const interacting = this.canEdit('world') && this.Map.validateTile(tile.x, tile.y)

      this.sessionStore.setDocument('editor', agentId, {
        position: tile,
        interacting,
      })
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
    const pointerMesh = this.localStore.getDocument('pointerMesh', 'pointerMesh')
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
    const editor = this.sessionStore.getDocument('editor', id)
    if (editor === null) return

    const { position: { x, y }, interacting } = editor

    const pointerMesh = this.localStore.getDocument('pointerMesh', 'pointerMesh')

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

    const editor = this.sessionStore.getDocument('editor', id)
    if (editor === null) return

    const { position: { x, y }, interacting } = editor
    if (!interacting) return

    if (!this.Map.validateTile(x, y)) {
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
      x,
      y,
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
    const editor = this.sessionStore.getDocument('editor', id)

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
