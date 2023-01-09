import * as THREE from 'three'
import { nanoid } from 'nanoid'
import * as Room from '../networking'
import * as Map from './map'
import * as Portal from './portal'
import * as Book from './book'
import { getActionState, addActionDownListener } from '../controller'
import { getLocalStore, getRemoteStore } from '../singleton'
import { roundToNearest } from '../utils'

export const getMousePosition = (e, canvas) => {
  const rect = canvas.getBoundingClientRect()
  const x = (e.clientX - rect.left) / canvas.scrollWidth * canvas.width
  const y = (e.clientY - rect.top) / canvas.scrollHeight * canvas.height

  return {
    x,
    y,
  }
}

export const init = (canvas, id) => {
  const localStore = getLocalStore()
  const remoteStore = getRemoteStore()

  const handleMouseMove = (e) => {
    const { x, y } = getMousePosition(e, canvas)

    remoteStore.setDocument('editor', id, {
      position: {
        x,
        y,
      },
      interacting: true,
    })
  }

  const handleMouseOver = (e) => {
    const { x, y } = getMousePosition(e, canvas)
    
    remoteStore.setDocument('editor', id, {
      position: {
        x,
        y,
      },
      interacting: true,
    })
  }
  
  const handleMouseOut = (e) => {
    const { x, y } = getMousePosition(e, canvas)

    remoteStore.setDocument('editor', id, {
      position: {
        x: x * 32,
        y: y * 32,
      },
      interacting: false,
    })
  }

  remoteStore.on({ type: 'editor', event: 'update' }, (id, editor) => {
    // id is the agent id.
    // Update the sprite location to be the position of the player.
    const selectionMesh = localStore.getDocument('selection-mesh', id)

    if (selectionMesh === null) {
      return
    }

    selectionMesh.position.set(
      (Math.floor(editor.position.x / 32)) +0.5 ,
      (-Math.floor(editor.position.y / 32))-0.5,
      .9,
    )

    selectionMesh.visible = editor.interacting
  })

  addActionDownListener('createPortal', () => {
    const store = getRemoteStore()
    const editor = store.getDocument('editor', id)

    if (editor === null) {
      return
    }

    const { position: { x, y }, interacting } = editor

    if (interacting) {
      const slug = window.prompt('The portal leads to...', 'test')

      if (slug === null) {
        return
      }

      Portal.create(nanoid(), Math.floor(x / 32), Math.floor(y / 32), slug)
    }
  })

  addActionDownListener('createBook', () => {
    const store = getRemoteStore()
    const editor = store.getDocument('editor', id)

    if (editor === null) {
      return
    }

    const { position: { x, y }, interacting } = editor

    if (interacting) {
      const text = window.prompt('The book reads...', 'test')

      if (text === null) {
        return
      }

      Book.create(nanoid(), Math.floor(x / 32), Math.floor(y / 32), text)
    }
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

  const selectionMat = new THREE.MeshBasicMaterial({ color: 0x0000FF, transparent: true, opacity: 0.23 })
  const selectionMesh = new THREE.Mesh(selectionGeometry, selectionMat)

  scene.add(selectionMesh)

  localStore.setDocument('raycastPointer', 'raycastPointer', selectionMesh)

  const handleMouseMove = (e) => {
    const pointer = new THREE.Vector2()
    const rect = canvas.getBoundingClientRect()

    pointer.x = (( e.clientX - rect.left ) / rect.width) * 2 - 1
    pointer.y = - (( e.clientY - rect.top ) / rect.height) * 2 + 1
    localStore.setDocument('pointer', 'pointer', pointer)

    doPicking()

    const pickingLocation = localStore.getDocument('pickingLocation', 'pickingLocation')
    
    if (pickingLocation !== null) {
      remoteStore.setDocument('editor', id, {
        position: {
          x: Math.floor(pickingLocation.x)*32,
          y: Math.floor(-pickingLocation.y - 1)*32,
        },
        interacting: true,
      })
    }
  }
  
  const handleMouseOver = (e) => {
    const pointer = new THREE.Vector2()
    const rect = canvas.getBoundingClientRect()

    pointer.x = (( e.clientX - rect.left ) / rect.width) * 2 - 1
    pointer.y = - (( e.clientY - rect.top ) / rect.height) * 2 + 1
    localStore.setDocument('pointer', 'pointer', pointer)
    
    doPicking()

    const pickingLocation = localStore.getDocument('pickingLocation', 'pickingLocation')

    if (pickingLocation !== null) {
      remoteStore.setDocument('editor', id, {
        position: {
          x: Math.floor(pickingLocation.x)*32,
          y: Math.floor(-pickingLocation.y - 1)*32,
        },
        interacting: true,
      })
    }
  }
  
  const handleMouseOut = (e) => {
    const pointer = new THREE.Vector2()
    const rect = canvas.getBoundingClientRect()

    pointer.x = (( e.clientX - rect.left ) / rect.width) * 2 - 1
    pointer.y = - (( e.clientY - rect.top ) / rect.height) * 2 + 1
    localStore.setDocument('pointer', 'pointer', pointer)
    
    doPicking()
    
    const pickingLocation = localStore.getDocument('pickingLocation', 'pickingLocation')
    
    if (pickingLocation !== null) {
      remoteStore.setDocument('editor', id, {
        position: {
          x: Math.floor(pickingLocation.x)*32,
          y: Math.floor(-pickingLocation.y - 1)*32,
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
    
    normalMatrix.getNormalMatrix( intersects[0].object.matrixWorld );
    worldNormal.copy( intersects[0].face.normal ).applyMatrix3( normalMatrix ).normalize()

    if(intersects[0].point.z < 0.1){
      pickingLocation.x = intersects[0].point.x + worldNormal.x / 2
      pickingLocation.y = (intersects[0].point.y + worldNormal.y / 2) -1
    } else {
      pickingLocation.x = intersects[0].point.x - worldNormal.x / 2
      pickingLocation.y = (intersects[0].point.y - worldNormal.y / 2) -1
    }

    localStore.setDocument('pickingLocation', 'pickingLocation', pickingLocation)

    pointerMesh.position.x = Math.floor(pickingLocation.x)+0.5
    pointerMesh.position.y = Math.floor(pickingLocation.y)+1.5
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

  if (getActionState('1')) {
    Map.update('world', Math.floor(x/32), Math.floor(y/32), 0)
  }

  if (getActionState('2')) {
    Map.update('world', Math.floor(x/32), Math.floor(y/32), 1)
  }

  if (getActionState('3')) {
    Map.update('world', Math.floor(x/32), Math.floor(y/32), 2)
  }

  if (getActionState('4')) {
    Map.update('world', Math.floor(x/32), Math.floor(y/32), 3)
  }

  if (getActionState('5')) {
    Map.update('world', Math.floor(x/32), Math.floor(y/32), 4)
  }

  if (getActionState('6')) {
    Map.update('world', Math.floor(x/32), Math.floor(y/32), 5)
  }

  if (getActionState('7')) {
    Map.update('world', Math.floor(x/32), Math.floor(y/32), 6)
  }

  if (getActionState('8')) {
    Map.update('world', Math.floor(x/32), Math.floor(y/32), 7)
  }

  if (getActionState('9')) {
    Map.update('world', Math.floor(x/32), Math.floor(y/32), 8)
  }

  if (getActionState('0')) {
    Map.update('world', Math.floor(x/32), Math.floor(y/32), 9)
  }
}

export const render = (id, context) => {
  const room = Room.get()
  const store = getRemoteStore()
  const editor = store.getDocument('editor', id)

  if (editor === null) {
    return
  }

  const { position: { x, y }, interacting } = editor

  context.lineWidth = 3
  context.strokeStyle = room.agentId === id ? 'blue' : 'red'

  if (interacting) {
    context.strokeRect(
      roundToNearest(x - 16, 32),
      roundToNearest(y - 16, 32),
      32,
      32,
    )
  }
}