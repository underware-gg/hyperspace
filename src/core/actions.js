import { EventEmitter } from 'events'

class Actions {
  constructor() {
    this.actionDownEmitter = new EventEmitter().setMaxListeners(20)
    this.actionUpEmitter = new EventEmitter().setMaxListeners(20)

    // Stores the mapping between keys and actions
    // e.g. 47: 'forward'
    this.keyMapping = {}

    // Stores the state of each action as a true or false value
    // e.g. forward: true
    this.actionStates = {}
  }

  // As part of init, all of the actions being listened for should be registered.
  registerActions = actions => {
    actions.forEach(({ name, keycode }) => {
      this.keyMapping[keycode] = name
      this.actionStates[name] = false
    })
  }

  getActionState = name => {
    return this.actionStates[name] || false
  }

  handleKeyDown = e => {
    if (e.metaKey) {
      if(e.code == 'KeyR') {
        window.location.reload()
      }
      return // ignore if CMD is pressed
    }
    const actionName = this.keyMapping[e.which]
    if (actionName) {
      this.actionDownEmitter.emit(actionName)
      this.actionStates[actionName] = true
    }
  }

  handleKeyUp = e => {
    const actionName = this.keyMapping[e.which]
    if (actionName) {
      this.actionUpEmitter.emit(actionName)
      this.actionStates[actionName] = false
    }
  }

  emitAction = (actionName, options) => {
    this.actionDownEmitter.emit(actionName, options)
  }

  clearKeys = e => {
    this.actionStates = {}
  }

  addActionDownListener = (actionName, callback) => {
    this.actionDownEmitter.addListener(actionName, callback)
  }

  addActionUpListener = (actionName, callback) => {
    this.actionUpEmitter.addListener(actionName, callback)
  }

  removeActionDownListener = (actionName, callback) => {
    this.actionDownEmitter.removeListener(actionName, callback)
  }

  removeActionUpListener = (actionName, callback) => {
    this.actionUpEmitter.removeListener(actionName, callback)
  }
}

export default Actions
