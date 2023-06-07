import EventEmitter from 'events'
import Kernal from '@/core/merge/kernal'
import { createOp } from '@/core/merge/tiny-merge'
import { createMessage } from '@/core/merge/messages'
import { typeDefs } from '@/core/merge/crdt-type'
import { getAgentId, getSnapshot, setSnapshot } from './persistence'
import { Client, LocalClient } from './client'

class ClientRoom extends EventEmitter {
  constructor(uri, {
    slug,
    store = null,
    agentId = null,
    roomId = null,
  }) {
    super()
    this.kernal = new Kernal(this.handleOps)
    this.store = store
    this.store.on(null, this.handleStoreChange)
    this.uri = uri
    this.slug = slug
    this.agentId = agentId ?? getAgentId()
    this.agentIds = [
      this.agentId,
    ]
    this.connectionStatus = undefined // when connected, true if room existed, false if new room
    this.roomId = roomId
    this.isLocal = false
  }

  init({
    loadLocalSnapshot = false,
    connectCallback = null,
    isLocal = false,
  }) {
    this.connectCallback = connectCallback

    // load snapshot from browser local store
    if (loadLocalSnapshot === true) {
      const snapshot = getSnapshot(this.slug)
      if (snapshot.length > 0) {
        this.kernal.applyOps(snapshot, 'database')
      }
    }

    this.client = isLocal ? new LocalClient() : new Client({
      uri: this.uri + '/api/room/' + this.slug + '/websocket',
    }, this.kernal )

    this.client.addListener('open', this.handleOpen)
    this.client.addListener('close', this.handleClose)
    this.client.addListener('error', this.handleError)
    this.client.addListener('message', this.handleMessage)
    // console.log(`[${this.slug}][${this.roomId}] new Client()...`, this.client)
  }

  shutdown = () => {
    console.log(`[${this.slug}][${this.roomId}] shutdown`)
    this.store?.off(null, this.handleStoreChange)
    this.store = null
    this.client?.shutdown()
    this.client = null
  }

  sendMessage(message) {
    this.client.addMessage(message)
  }

  handleOpen = () => {
    const ops = this.getSnapshotOps()
    this.client.addMessage(createMessage.connect(this.agentId, ops))
  }

  handleClose = () => { }
  handleError = () => { }
  handlePatch = () => { }

  getSnapshotOps = () => {
    return this.kernal.getSnapshotOps()
  }

  // use importCrdtData()
  // applySnapshotOps = (ops) => {
  //   this.kernal.applyOps(ops, 'remote')
  // }

  handleStoreChange = (source, type, id, path, value) => {
    if (source === 'local') {
      const op = createOp(
        this.kernal.versions[type],
        type,
        id,
        path,
        [this.kernal.latestSeq + 1, this.agentId],
        value,
      )

      this.kernal.applyOps([op], source)
    }
  }

  handleOps = (ops, source) => {
    if (source === 'remote') {
      // Ideally we'd be pushing ops somewhere and then periodically squashing them.
      setSnapshot(this.slug, this.getSnapshotOps())
    } else if (source === 'local') {
      // Add changes...
      this.client.addOps(ops)

      // Ideally we'd be pushing ops somewhere and then periodically squashing them.
      setSnapshot(this.slug, this.getSnapshotOps())
    }

    if (source !== 'local') {
      for (const { type, key, pathIndex, value } of ops) {
        const typeDef = typeDefs[type]
        const pathArr = typeDef.paths[pathIndex]
        const path = `/${pathArr.join('.')}`
        this.store.setValueAtPath(type, key, path, value, source)
      }
    }
  }

  addAgentId = (agentId) => {
    if (!this.hasAgentId(agentId)) {
      this.agentIds.push(agentId)
    }
    this.emit('agent-join', agentId)
  }

  removeAgentId = (agentId) => {
    if (!this.hasAgentId(agentId)) {
      return
    }
    this.agentIds = this.agentIds.filter((id) => id !== agentId)
    this.emit('agent-leave', agentId)
  }

  hasAgentId = (agentId) => {
    return this.agentIds.some((id) => id === agentId)
  }

  applyMessageOps = (ops, from) => {
    this.kernal.applyOps(ops, 'remote')

    if (from == 'connect') {
      this.connectionStatus = ops.length > 0
      if (this.connectCallback) {
        this.connectCallback(ops)
      }
    }
    // console.warn(`[${this.slug}][${this.roomId}] PATCHED from [${from}]`, ops)

    this.emit('patched', ops.length > 0)
  }

  waitForConnection = async () => {
    let that = this
    await new Promise(function (resolve) {
      (function loopUntilConnected() {
        if (that.connectionStatus !== undefined) {
          return resolve()
        }
        setTimeout(loopUntilConnected, 100)
      })()
    })
    return this.connectionStatus
  }

  handleMessage = (message) => {
    switch (message.type) {
      case 'connect': {
        this.applyMessageOps(message.ops, 'connect')
        break
      }
      case 'patch': {
        this.applyMessageOps(message.ops, 'patch')
        break
      }
      case 'connected': {
        console.log(`[${this.slug}][${this.roomId}] agent connected:`, message.agentId)
        this.addAgentId(message.agentId)
        break
      }
      case 'disconnected': {
        console.log(`[${this.slug}][${this.roomId}] agent disconnected:`, message.agentId)
        this.removeAgentId(message.agentId)
        break
      }
    }
  }
}

export default ClientRoom
