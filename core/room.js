import * as THREE from 'three'
import {
  registerActions,
  handleKeyDown,
  handleKeyUp,
  addActionDownListener,
} from './controller'
import * as Room from './networking'
import * as Player from './components/player'
import * as Map from './components/map'
import * as Editor from './components/editor'
import * as Portal from './components/portal'
import * as Book from './components/book'
import { getRemoteStore, getLocalStore } from './singleton'
import { createRenderTexture } from './textures'
import { renderMarkdown } from './canvas-markdown'

// 1.9 - 1.2
const documentTexture = createRenderTexture(640, 404)

export const init = async (slug, canvas, canvas3d) => {
  registerActions([
    {
      name: 'left',
      keycode: '65', // a
    },
    {
      name: 'right',
      keycode: '68', // d
    },
    {
      name: 'up',
      keycode: '87', // w
    },
    {
      name: 'down',
      keycode: '83', // s
    },
    {
      name: '1',
      keycode: '49',
    },
    {
      name: '2',
      keycode: '50',
    },
    {
      name: '3',
      keycode: '51',
    },
    {
      name: '4',
      keycode: '52',
    },
    {
      name: '5',
      keycode: '53',
    },
    {
      name: '6',
      keycode: '54',
    },
    {
      name: '7',
      keycode: '55',
    },
    {
      name: '8',
      keycode: '56',
    },
    {
      name: '9',
      keycode: '57',
    },
    {
      name: '0',
      keycode: '48',
    },
    {
      name: 'turnLeft',
      keycode: '74', // j
    },
    {
      name: 'turnRight',
      keycode: '76', // l
    },
    {
      name: 'moveForward',
      keycode: '73', // i
    },
    {
      name: 'moveBack',
      keycode: '75', // k
    },
    {
      name: 'toggle3d',
      keycode: '84', // t
    },
    {
      name: 'createPortal',
      keycode: '80', // p
    },
    {
      name: 'createBook',
      keycode: '66', // b
    },
    {
      name: 'interact',
      keycode: '69', // e
    },
    {
      name: 'jump',
      keycode: '32', // space
    },
    {
      name: 'delete',
      keycode: '46', // delete
    },
    {
      name: 'turnLeft',
      keycode: '37', // right
    },
    {
      name: 'up',
      keycode: '38', // up
    },
    {
      name: 'turnRight',
      keycode: '39', // left
    },
    {
      name: 'down',
      keycode: '40', // down
    },
  ])

  addActionDownListener('toggle3d', () => {
    const localStore = getLocalStore()
    const is3d = localStore.getDocument('show-3d', 'world')
    localStore.setDocument('show-3d', 'world', !is3d)
  })

  canvas.addEventListener('keydown', (e) => {
    e.preventDefault()
    handleKeyDown(e)
  }, false)

  canvas3d.addEventListener('keydown', (e) => {
    e.preventDefault()
    handleKeyDown(e)
  }, false)
  
  canvas.addEventListener('keyup', e => {
    e.preventDefault()
    handleKeyUp(e)
  }, false)

  canvas3d.addEventListener('keyup', e => {
    e.preventDefault()
    handleKeyUp(e)
  }, false)

  Room.init(slug)
  const room = Room.get()

  addActionDownListener('interact', () => {
    // const localStore = getLocalStore()
    // console.log('_INTERACT_')
    Player.interact(room.agentId)
  })

  Editor.init(canvas, room.agentId)
  Editor.init3d(canvas3d, room.agentId)
  Player.init()
  Map.init()
  Portal.init()
  Book.init()

  room.init(slug)

  if (!Player.exists(room.agentId)) {
    Player.create(
      room.agentId,
      50,
      50,
    )
  }

  if (!Map.exists('world')) {
    Map.create('world')
  }

  const cellWidth = 1.9
  const cellHeight = 1.2
  const documentGeometry = new THREE.PlaneGeometry(cellWidth, cellHeight, 1, 1)
  const documentMaterial = new THREE.MeshBasicMaterial({
    map: documentTexture.texture,
  })
  const documentMesh = new THREE.Mesh(documentGeometry, documentMaterial)
  documentMesh.position.set(10, -1.01, .75)
  documentMesh.rotation.set(90*Math.PI/180, 0, 0)
  const localStore = getLocalStore()
  const scene = localStore.getDocument('scene', 'scene')
  if (scene === null) {
    return
  }
  scene.add(documentMesh)

  getRemoteStore().setDocument('presentation', 'presentation', { 
    visible: false,
    slide: 0,
  })
}

export const update = (dt) => {
  const room = Room.get()
  Player.update(room.agentId, dt)
  Editor.update(room.agentId, dt)
  // Only do this when you are interacting with it.
  // Map.update('world', x, y, 3)
}

export const render = (canvas, context) => {
  const store = getRemoteStore()
  const playerIds = store.getIds('player')
  const portalIds = store.getIds('portal')
  const bookIds = store.getIds('book')
  const document = store.getDocument('document', 'world')
  const text = document?.content || ''

  Map.render('world', context)

  // This should be rendered to another canvas only when changes occur.
  renderMarkdown(text, documentTexture.canvas, documentTexture.context)
  documentTexture.texture.needsUpdate = true

  // const renderImage = new Image()
  // renderImage.src = documentTexture.canvas.toDataURL()
  // context.drawImage(renderImage, 128, 64, 256, 256)

  const room = Room.get()

  for (const portalId of portalIds) {
    Portal.render(portalId, context)
  }
  for (const bookId of bookIds) {
    Book.render(bookId, context)
  }

  // Should probably be able to just get them directly.
  for (const playerId of playerIds) {
    if (room.hasAgentId(playerId)) {
      Player.render(playerId, context)
      Editor.render(playerId, context)
    }
  }

  Map.render3D('world')
}
