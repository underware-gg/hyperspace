import {
  registerActions,
  handleKeyDown,
  handleKeyUp,
  addActionDownListener,
} from '@/core/controller'
import { loadTextures } from '@/core/textures'
import * as ClientRoom from '@/core/networking'
import Renderer2D from '@/core/rendering/renderer2D'
import Renderer3D from '@/core/rendering/renderer3D'
import Portal from '@/core/components/portal'
import Trigger from '@/core/components/trigger'
import Screen from '@/core/components/screen'
import Player from '@/core/components/player'
import Profile from '@/core/components/profile'
import Permission from '@/core/components/permission'
import Settings from '@/core/components/settings'
import Tileset from '@/core/components/tileset'
import Map from '@/core/components/map'
import Editor from '@/core/components/editor'
import Store from '@/core/store'

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
    this.remoteStore = new Store()
    this.localStore = new Store()
    // TODO: Instantiate ClientRoom here
    // this.clientRoom = ClientRoom.create()

    this.renderer2D = new Renderer2D(this)
    this.renderer3D = new Renderer3D(this)
  }

  async init(slug, canvas2d, canvas3d) {
    this.canvas2d = canvas2d
    this.canvas3d = canvas3d

    await loadTextures()

    this.renderer2D.init(canvas2d)
    this.renderer3D.init(canvas3d)

    this.clientRoom = ClientRoom.create(slug, this.remoteStore)

    // instantiate before this.clientRoom.init() to listen to snapshot loading events
    this.Portal = new Portal(this)
    this.Trigger = new Trigger(this)
    this.Screen = new Screen(this)
    this.Player = new Player(this)
    this.Profile = new Profile(this)
    this.Permission = new Permission(this)
    this.Settings = new Settings(this)
    this.Tileset = new Tileset(this)
    this.Map = new Map(this)
    this.Editor = new Editor(this)

    // loads snapshot
    this.clientRoom.init(slug)

    this.Settings.initializeSettings('world')
    this.Map.initializeMap('world')

    this.Editor.init2d(canvas2d, this.clientRoom.agentId)
    this.Editor.init3d(canvas3d, this.clientRoom.agentId)

    const { VeridaUser } = (await import('@/core/verida'))
    this.localStore.setDocument('user', 'VeridaUser', VeridaUser)

    // Event listeners
    registerActions(_actions)

    addActionDownListener('toggle3d', () => {
      const is3d = this.localStore.getDocument('show-3d', 'world')
      this.localStore.setDocument('show-3d', 'world', !is3d)
    })

    addActionDownListener('interact', () => {
      this.Player.interact(this.clientRoom.agentId)
    })

    canvas2d?.addEventListener('keydown', (e) => {
      e.preventDefault()
      handleKeyDown(e)
    }, false)

    canvas3d?.addEventListener('keydown', (e) => {
      e.preventDefault()
      handleKeyDown(e)
    }, false)

    canvas2d?.addEventListener('keyup', e => {
      e.preventDefault()
      handleKeyUp(e)
    }, false)

    canvas3d?.addEventListener('keyup', e => {
      e.preventDefault()
      handleKeyUp(e)
    }, false)
  }

  update(dt) {
    this.renderer2D.update(dt)
    this.renderer3D.update(dt)
    this.Player.update(this.clientRoom.agentId, dt)
    this.Editor.update(this.clientRoom.agentId, dt)
  }

  render() {
    this.render2d(this.canvas2d)
    this.render3d(this.canvas2d)
  }

  render2d() {
    if (this.canvas2d == null) {
      return
    }

    this.renderer2D.render(this.canvas2d)

    const context = this.canvas2d.getContext('2d')
    this.Map.render2d('world', context, this.remoteStore)

    const playerIds = this.remoteStore.getIds('player')
    const portalIds = this.remoteStore.getIds('portal')
    const triggerIds = this.remoteStore.getIds('trigger')
    const screenIds = this.remoteStore.getIds('screen')

    for (const id of portalIds) {
      this.Portal.render2d(id, context)
    }
    for (const id of triggerIds) {
      this.Trigger.render2d(id, context)
    }
    for (const id of screenIds) {
      this.Screen.render2d(id, context, this.clientRoom.agentId)
    }

    // Should probably be able to just get them directly.
    for (const playerId of playerIds) {
      if (this.clientRoom.hasAgentId(playerId)) {
        this.Player.render2d(playerId, context)
        this.Editor.render2d(playerId, context)
      }
    }
  }

  render3d() {
    if (this.canvas3d == null) {
      return
    }
    this.renderer3D.render()
    this.Map.render3d('world')
  }

}

export default Room


