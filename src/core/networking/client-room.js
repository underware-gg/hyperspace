import EventEmitter from 'events'
import Kernal from '@/core/merge/kernal'
import { createOp } from '@/core/merge/tiny-merge'
import { createMessage } from '@/core/merge/messages'
import { typeDefs } from '@/core/merge/crdt-type'
import { getAgentId, getSnapshot, setSnapshot } from './persistence'
import Client from './client'

class ClientRoom extends EventEmitter {
  constructor(uri, {
    slug,
    store = null,
    agentId = null,
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
  }

  init({
    sourceData = null,
    loadLocalSnapshot = false,
    connectCallback = null,
  }) {
    this.initialized = sourceData != null
    this.connectCallback = connectCallback

    // load snapshot from browser local store
    if (!this.initialized && loadLocalSnapshot === true) {
      sourceData = getSnapshot(this.slug)
    }

    // initialize store data
    if (sourceData?.length > 0) {
      this.kernal.applyOps(sourceData, 'database')
    }

    this.client = new Client(
      { uri: this.uri + '/api/room/' + this.slug + '/websocket' },
      this.kernal,
    )
    this.client.addListener('open', this.handleOpen)
    this.client.addListener('close', this.handleClose)
    this.client.addListener('error', this.handleError)
    this.client.addListener('message', this.handleMessage)
  }

  shutdown = () => {
    this.store.off(null, this.handleStoreChange)
    this.store = null
    this.client.shutdown()
    this.client = null
  }

  sendMessage(message) {
    this.client.addMessage(message)
  }

  handleOpen = () => {
    const ops = this.kernal.getSnapshotOps()
    this.client.addMessage(createMessage.connect(this.agentId, ops))
  }

  handleClose = () => { }
  handleError = () => { }
  handlePatch = () => { }

  getSnapshotOps = () => {
    return this.kernal.getSnapshotOps()
  }

  applySnapshotOps = (ops) => {
    this.kernal.applyOps(ops, 'database')
  }

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
      setSnapshot(this.slug, this.kernal.getSnapshotOps())
    } else if (source === 'local') {
      // this.client.addMessage(createMessage.patch(ops))
      // Add changes...
      this.client.addOps(ops)

      // Ideally we'd be pushing ops somewhere and then periodically squashing them.
      setSnapshot(this.slug, this.kernal.getSnapshotOps())
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
    // console.warn(`[${this.slug}]+PATCHED from [${from}]`, ops.length > 0)
    this.emit('patched', ops.length > 0)

    if (from == 'connect') {
      if (this.connectCallback) {
        this.connectCallback(ops)
      } else if (this.initialized) {
        return
      }
    }
    
    this.kernal.applyOps(ops, 'remote')
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
        console.log(`[${this.slug}] connected:`, message.agentId)
        this.addAgentId(message.agentId)
        break
      }
      case 'disconnected': {
        console.log(`[${this.slug}] disconnected:`, message.agentId)
        this.removeAgentId(message.agentId)
        break
      }
    }
  }
}

export default ClientRoom
