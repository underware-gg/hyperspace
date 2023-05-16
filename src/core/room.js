import Actions from '@/core/actions'
import * as ClientRoom from '@/core/networking'
import { loadTextures } from '@/core/textures'
import { importCrdtData } from '@/core/export-import'
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

let _roomCounter = 0
let _openRooms = 0

class Room {

  constructor() {
    this.localStore = new Store()
    this.remoteStore = new Store()
    this.sessionStore = new Store()
    this.agentStore = new Store()

    this.renderer2D = new Renderer2D(this)
    this.renderer3D = new Renderer3D(this)

    this.actions = new Actions()

    this.roomId = ++_roomCounter
    ++_openRooms
    // console.warn(`[${this.roomId}] new Room() open [${_openRooms}]`)
  }

  async init({
    // opens Room client if slug is defined
    slug = null,
    branch = null,
    isLocal = false,
    forceRevert = false,
    // opens Room Session client if slug is defined AND openSession
    openSession = true,
    // opens Agents Session
    openAgents = true,
    // Render only defined canvases
    canvas2d = null,
    canvas3d = null,
    // sourceData = null,
  }) {
    // source slug is the source of room data
    this.sourceSlug = slug?.toLowerCase() ?? null
    
    // slug is the actual room in use, synched to the server
    // same as source slug, unless using a branch
    this.branch = branch
    this.slug = (this.sourceSlug && this.branch) ? `${this.sourceSlug}:${this.branch}` : this.sourceSlug
    this.isLocal = isLocal

    // this.sourceData = sourceData

    this.canvas2d = canvas2d
    this.canvas3d = canvas3d

    // load all async resources beforehand
    const { VeridaUser } = (await import('@/core/verida'))
    await loadTextures()

    this.renderer2D.init(this.canvas2d)
    this.renderer3D.init(this.canvas3d)

    // room client: the actual room in use, synched with the server
    // can be null
    this.clientRoom = (this.slug) ? ClientRoom.create({
      slug: this.slug,
      store: this.remoteStore,
      roomId: this.roomId,
    }) : null

    // session client: transient data (player, editor)
    // can be null
    this.clientSession = (this.slug && openSession) ? ClientRoom.create({
      slug: `${this.slug}::session`,
      store: this.sessionStore,
      roomId: this.roomId,
    }) : null

    // agents client: persistent agents data (profiles)
    // cannot be null
    this.clientAgent = (openAgents) ? ClientRoom.create({
      slug: ':agents',
      store: this.agentStore,
      roomId: this.roomId,
    }) : null

    this.agentId = this.clientAgent?.agentId ?? this.clientRoom?.agentId ?? null

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

    // Read source data, if available
    // do it before client connections to avoid rate limiting
    const sourceData = await this.fetchSourceData()

    // start clients

    this.clientRoom?.init({
      loadLocalSnapshot: true,
      isLocal: this.isLocal,
    })

    this.clientSession?.init({
      isLocal: this.isLocal,
    })

    this.clientAgent?.init({
      loadLocalSnapshot: true,
    })

    // wait for Room client to load
    const hasClientData = await this.clientRoom?.waitForConnection()
    // console.log(`CLIENT CONNECTED!`, hasClientData)

    // apply initial to room
    if ((forceRevert || isLocal || hasClientData === false) && sourceData) {
      console.warn(`REVERTING...`)
      importCrdtData(sourceData, this.remoteStore, true)
    }

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
    --_openRooms
    // console.warn(`[${this.roomId}] SHUTDOWN open [${_openRooms}]`)
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

  fetchSourceData = async () => {
    let result = null
    if (this.sourceSlug && this.sourceSlug != this.slug) {
      let sourceStore = new Store()

      let sourceClient = ClientRoom.create({
        slug: this.sourceSlug,
        store: sourceStore,
        roomId: this.roomId,
      })

      sourceClient.init({
        loadLocalSnapshot: true,
      })

      const hasSourceData = await sourceClient.waitForConnection()
      // console.log(`loadSourceData()`, hasSourceData)

      if (hasSourceData === true) {
        result = sourceClient.getSnapshotOps()
        console.log(`[${this.sourceSlug}] data > [${this.slug}]`, hasSourceData, result)
      }

      // close source client
      sourceClient.shutdown()
      sourceClient = null
    }
    return result
  }

  revertToSourceRoom = async () => {
    const sourceData = await this.fetchSourceData()
    if(!sourceData) return false
    
    importCrdtData(sourceData, this.remoteStore, true)
    return true
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
      if (this.clientRoom?.hasAgentId(playerId)) {
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
