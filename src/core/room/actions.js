import { EventEmitter } from 'events'

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
  registerActions = (actions = null) => {
    (actions ?? _actions).forEach(({ name, keycode }) => {
      this.keyMapping[keycode] = name
      this.actionStates[name] = false
    })
  }

  getActionState = name => {
    return this.actionStates[name] || false
  }

  handleKeyDown = e => {
    if (e.metaKey) {
      // CMD+R : reload page
      if (e.code == 'KeyR') {
        window.location.reload()
      }
      // ignore if CMD is pressed
      return
    }
    const actionName = this.keyMapping[e.which]
    if (actionName && !e.repeat) {
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
