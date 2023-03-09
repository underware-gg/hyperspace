import {
  registerActions,
  handleKeyDown,
  handleKeyUp,
  addActionDownListener,
} from '@/core/controller'
import * as ClientRoom from '@/core/networking'
import Renderer2D from '@/core/rendering/renderer2D'
import Renderer3D from '@/core/rendering/renderer3D'
import Portal from '@/core/components/portal'
import Trigger from '@/core/components/trigger'
import * as Settings from '@/core/components/settings'
import * as Map from '@/core/components/map'
import * as Player from '@/core/components/player'
import * as Editor from '@/core/components/editor'
import * as Screen from '@/core/components/screen'
import { getRemoteStore, getLocalStore } from '@/core/singleton'

const _actions = [
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
    // name: 'createPortal',
    name: 'editPortal',
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
]

class Room {

  constructor() {
    // TODO: Move singletons here
    this.remoteStore = getRemoteStore()
    this.localStore = getLocalStore()
    // TODO: Instantiate ClientRoom here
    // this.clientRoom = ClientRoom.create()

    this.renderer2D = new Renderer2D(this)
    this.renderer3D = new Renderer3D(this)
  }

  async init(slug, canvas, canvas3d) {
    const context = canvas.getContext('2d')
    this.renderer2D.init(context)
    this.renderer3D.init(canvas3d)

    ClientRoom.init(slug)
    this.clientRoom = ClientRoom.get() // TODO: remove

    // before room.init() to listen snapshot 'create' events
    this.Portal = new Portal(this)
    this.Trigger = new Trigger(this)
    Screen.init()

    // loads snapshot
    this.clientRoom.init(slug)

    if (!Settings.exists('world')) {
      Settings.create('world')
    }

    Editor.init(canvas, this.clientRoom.agentId)
    Editor.init3d(canvas3d, this.clientRoom.agentId)
    Player.init()
    Map.init()

    if (!Map.exists('world')) {
      Map.create('world')
    }

    if (!Player.exists(this.clientRoom.agentId)) {
      Player.create(
        this.clientRoom.agentId,
      )
    }

    const { VeridaUser } = (await import('@/core/verida'))
    this.localStore.setDocument('user', 'VeridaUser', VeridaUser)

    // Event listeners
    registerActions(_actions)

    addActionDownListener('toggle3d', () => {
      const is3d = this.localStore.getDocument('show-3d', 'world')
      this.localStore.setDocument('show-3d', 'world', !is3d)
    })

    addActionDownListener('interact', () => {
      Player.interact(this.clientRoom.agentId)
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
  }

  update(dt) {
    this.renderer2D.update(dt)
    this.renderer3D.update(dt)
    Player.update(this.clientRoom.agentId, dt)
    Editor.update(this.clientRoom.agentId, dt)
  }

  render(canvas) {
    const context = canvas.getContext('2d')
    this.renderer2D.render(canvas, context)
    this.renderer3D.render()

    const playerIds = this.remoteStore.getIds('player')
    const portalIds = this.remoteStore.getIds('portal')
    const triggerIds = this.remoteStore.getIds('trigger')
    const screenIds = this.remoteStore.getIds('screen')

    Map.render2d('world', context, this.remoteStore)

    for (const id of portalIds) {
      this.Portal.render2d(id, context)
    }
    for (const id of triggerIds) {
      this.Trigger.render2d(id, context)
    }
    for (const id of screenIds) {
      Screen.render2d(id, context, this.clientRoom.agentId)
    }

    // Should probably be able to just get them directly.
    for (const playerId of playerIds) {
      if (this.clientRoom.hasAgentId(playerId)) {
        Player.render2d(playerId, context)
        Editor.render2d(playerId, context)
      }
    }

    Map.render3D('world')
  }

}

export default Room


