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
import Wallet from '@/core/components/wallet'
import Settings from '@/core/components/settings'
import Tileset from '@/core/components/tileset'
import Map from '@/core/components/map'
import Editor from '@/core/components/editor'
import Store from '@/core/store'

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

  async init({
    slug = null,
    key = null,
    canvas2d = null,
    canvas3d = null,
  }) {
    // source slug is the source of room data
    this.sourceSlug = slug?.toLowerCase() ?? null
    
    // slug is the actual room in use, synched to the server
    // usually is the same as source slug
    this.slug = (this.sourceSlug && key) ? `${this.sourceSlug}:${key}` : this.sourceSlug

    this.canvas2d = canvas2d
    this.canvas3d = canvas3d

    // load all async resources beforehand
    const { VeridaUser } = (await import('@/core/verida'))
    await loadTextures()

    this.renderer2D.init(this.canvas2d)
    this.renderer3D.init(this.canvas3d)

    // source client: contains the room initial data
    // if is the same as room client, no need to start
    // can be null
    if (this.sourceSlug != this.slug) {
      this.clientSource = this.slug ? ClientRoom.create({
        slug: this.sourceSlug,
        store: this.remoteStore,
      }) : null
    }

    // room client: the actual room in use, synched with the server
    // can be null
    this.clientRoom = this.slug ? ClientRoom.create({
      slug: this.slug,
      store: this.remoteStore,
    }) : null

    // session client: transient data (player, editor)
    // can be null
    this.clientSession = this.slug ? ClientRoom.create({
      slug: `${this.slug}::session`,
      store: this.sessionStore,
    }) : null

    // agents client: persistent agents data (profiles)
    // cannot be null
    this.clientAgent = ClientRoom.create({
      slug: ':agents',
      store: this.agentStore,
    })

    this.agentId = this.clientAgent.agentId

    if (this.slug) {
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
    }

    // agentStore
    this.Profile = new Profile(this)
    this.Wallet = new Wallet(this)

    this.sourceData = null

    // load data from source client
    if (this.clientSource) {
      // start source client to fetch initial data
      this.clientSource.init({
        connectCallback: (data) => {
          this.sourceData = data
        }
      })

      // await source data to be loaded
      const _that = this
      await new Promise(function (resolve) {
        (function waitForData() {
          if (_that.sourceData != null) return resolve()
          setTimeout(waitForData, 100)
        })()
      })
      console.log(`[${this.sourceSlug}] data >> [${this.slug}]`)

      // close source client
      this.clientSource.shutdown()
      this.clientSource = null
    }

    // start clients

    this.clientRoom?.init({
      sourceData: this.sourceData,  // use this data
      loadLocalSnapshot: true,      // or else load from local storage
    })

    this.clientSession?.init({})
    
    this.clientAgent.init({
      loadLocalSnapshot: true,
    })

    this.Editor?.init2d(this.canvas2d, this.agentId)
    this.Editor?.init3d(this.canvas3d, this.agentId)

    this.localStore.setDocument('user', 'VeridaUser', VeridaUser)

    // Event listeners
    this.actions.registerActions()

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
    this.clientRoom?.shutdown()
    this.clientRoom = null
    this.clientSession?.shutdown()
    this.clientSession = null
    this.clientAgent?.shutdown()
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
    this.Player?.update(this.agentId, dt)
    this.Editor?.update(this.agentId, dt)
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

    const playerIds = this.sessionStore.getIds('player')
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
      this.Screen.render2d(id, context, this.agentId)
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
