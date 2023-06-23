import Room from '@/core/room/room'

class Game {
  constructor() {
    this.init = this.init.bind(this)
    this.shutdown = this.shutdown.bind(this)
    this.render = this.render.bind(this)

    this.room = new Room()

    this.lastTime = (new Date()).getTime()
    this.currentTime = 0
    this.dt = 0
  }

  async init(options) {

    await this.room.init(options)

    this.lastTime = (new Date()).getTime()
    this.currentTime = 0
    this.dt = 0

    this.running = true
    window.requestAnimationFrame(this.render)
  }

  shutdown() {
    this.running = false
    this.room.shutdown()
    this.room = null
  }

  render() {
    if (!this.running) {
      return
    }
    this.currentTime = (new Date()).getTime()
    this.dt = (this.currentTime - this.lastTime) / 1000

    this.room.update(this.dt)

    this.room.render()

    this.lastTime = this.currentTime

    window.requestAnimationFrame(this.render)
  }
}

export default Game
