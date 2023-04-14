import Actions from '@/core/actions'
import * as ClientRoom from '@/core/networking'
import { loadTextures } from '@/core/textures'
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
    name: '-',
    keycode: '189',
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
    this.localStore = new Store()
    this.remoteStore = new Store()
    this.sessionStore = new Store()
    this.agentStore = new Store()

    this.renderer2D = new Renderer2D(this)
    this.renderer3D = new Renderer3D(this)

    this.actions = new Actions()
  }

  async init(slug, canvas2d, canvas3d) {
    this.slug = slug
    this.canvas2d = canvas2d
    this.canvas3d = canvas3d

    // load all async resources beforehand
    const { VeridaUser } = (await import('@/core/verida'))
    await loadTextures()

    this.renderer2D.init(this.canvas2d)
    this.renderer3D.init(this.canvas3d)

    this.clientRoom = ClientRoom.create(slug, this.remoteStore)
    this.clientSession = ClientRoom.create(`${slug}:session`, this.sessionStore)
    this.clientAgent = ClientRoom.create(':agents', this.agentStore)

    // instantiate components before this.clientRoom.init() to listen to snapshot loading events
    this.Settings = new Settings(this)
    this.Permission = new Permission(this)
    this.Player = new Player(this)
    this.Portal = new Portal(this)
    this.Trigger = new Trigger(this)
    this.Screen = new Screen(this)
    this.Tileset = new Tileset(this)
    this.Map = new Map(this)

    // sessionStore
    this.Editor = new Editor(this)

    // agentStore
    this.Profile = new Profile(this)

    // loads snapshots
    this.clientRoom.init(true)
    this.clientSession.init(false)
    this.clientAgent.init(true)

    this.Editor.init2d(this.canvas2d, this.clientRoom.agentId)
    this.Editor.init3d(this.canvas3d, this.clientRoom.agentId)

    this.localStore.setDocument('user', 'VeridaUser', VeridaUser)

    // Event listeners
    this.actions.registerActions(_actions)

    this.canvas2d?.addEventListener('keydown', this.handleKeyDown, false)
    this.canvas3d?.addEventListener('keydown', this.handleKeyDown, false)
    this.canvas2d?.addEventListener('keyup', this.handleKeyUp, false)
    this.canvas3d?.addEventListener('keyup', this.handleKeyUp, false)
  }

  shutdown = () => {
    this.canvas2d?.removeEventListener('keydown', this.handleKeyDown)
    this.canvas3d?.removeEventListener('keydown', this.handleKeyDown)
    this.canvas2d?.removeEventListener('keyup', this.handleKeyUp)
    this.canvas3d?.removeEventListener('keyup', this.handleKeyUp)
    this.clientRoom.shutdown()
    this.clientRoom = null
    this.clientSession.shutdown()
    this.clientSession = null
    this.clientAgent.shutdown()
    this.clientAgent = null
  }

  handleKeyDown = (e) => {
    e.preventDefault()
    this.actions.handleKeyDown(e)
  }

  handleKeyUp = (e) => {
    e.preventDefault()
    this.actions.handleKeyUp(e)
  }

  update(dt) {
    this.renderer2D.update(dt)
    this.renderer3D.update(dt)
    this.Player.update(this.clientRoom.agentId, dt)
    this.Editor.update(this.clientRoom.agentId, dt)
  }

  render() {
    this.render2d()
    this.render3d()
  }

  render2d() {
    if (this.canvas2d == null || this.canvas2d.style.display == 'none') {
      return
    }

    const context = this.canvas2d.getContext('2d', { alpha: false })
    context.beginPath() // make sure context drawing is closed

    // initialize context
    this.renderer2D.render(context, this.canvas2d)

    this.Map.render2d('world', context, this.canvas2d)

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

    context.closePath() // make sure context drawing is closed
  }

  render3d() {
    if (this.canvas3d == null || this.canvas3d.style.display == 'none') {
      return
    }
    this.renderer3D.render()
    this.Map.render3d('world')
  }

}

export default Room
