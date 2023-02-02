import * as THREE from 'three'
import {
  registerActions,
  handleKeyDown,
  handleKeyUp,
  addActionDownListener,
} from '@/core/controller'
import { HTMLMesh } from '@/core/rendering/HTMLMesh'
import * as Room from '@/core/networking'
import * as Player from '@/core/components/player'
import * as Map from '@/core/components/map'
import * as Editor from '@/core/components/editor'
import * as Portal from '@/core/components/portal'
import * as Screen from '@/core/components/screen'
import * as Book from '@/core/components/book'
import { getRemoteStore, getLocalStore } from '@/core/singleton'

export const init = async (slug, canvas, canvas3d, documentElement) => {
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
      name: 'createScreen',
      keycode: '78', // n
    },
    {
      name: 'createBook',
      keycode: '66', // b
    },
    {
      name: 'interact',
      keycode: '69', // e (enter)
    },
    {
      name: 'moveForward',
      keycode: '73', // i
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
      name: 'moveBack',
      keycode: '75', // k
    },
    {
      name: 'createPortal',
      keycode: '80', // p
    },
    {
      name: 'toggle3d',
      keycode: '84', // t
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
  Screen.init()

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

  const localStore = getLocalStore()
  const scene = localStore.getDocument('scene', 'scene')
  if (scene === null) {
    return
  }

  const aspect = process.env.BASE_WIDTH / process.env.BASE_HEIGHT
  const cellHeight = 1.5 //1.2
  const cellWidth = cellHeight * aspect

  const documentMesh = new HTMLMesh(documentElement, cellWidth, cellHeight, false)
  documentMesh.position.set(10, -1.01, .75)
  documentMesh.rotation.set(Math.PI / 2, 0, 0)

  scene.add(documentMesh)
  // scene.add(documentMeshBack)

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
  const store = getRemoteStore()
  const playerIds = store.getIds('player')
  for (const playerId of playerIds) {
    if (room.hasAgentId(playerId)) {
      Player.update3d(playerId)
    }
  }
}

export const render = (canvas, context) => {
  const store = getRemoteStore()
  const playerIds = store.getIds('player')
  const portalIds = store.getIds('portal')
  const screenIds = store.getIds('screen')
  const bookIds = store.getIds('book')

  Map.render2d('world', context)

  const room = Room.get()

  for (const portalId of portalIds) {
    Portal.render2d(portalId, context)
  }
  for (const screenId of screenIds) {
    Screen.render2d(screenId, context)
  }
  for (const bookId of bookIds) {
    Book.render2d(bookId, context)
  }

  // Should probably be able to just get them directly.
  for (const playerId of playerIds) {
    if (room.hasAgentId(playerId)) {
      Player.render2d(playerId, context)
      Editor.render2d(playerId, context)
    }
  }

  Map.render3D('world')
}
