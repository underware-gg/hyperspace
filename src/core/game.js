import { loadTextures } from '@/core/textures'
import Room from '@/core/room'

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

  async init(slug, canvas, canvas3d) {
    this.canvas = canvas
    this.canvas3d = canvas3d

    await loadTextures()

    this.room.init(slug, canvas, canvas3d)

    this.lastTime = (new Date()).getTime()
    this.currentTime = 0
    this.dt = 0

    this.running = true
    window.requestAnimationFrame(this.render)
  }

  shutdown() {
    this.running = false
  }

  render() {
    this.currentTime = (new Date()).getTime()
    this.dt = (this.currentTime - this.lastTime) / 1000

    this.room.update(this.dt)
  
    this.room.render(this.canvas)
  
    this.lastTime = this.currentTime
  
    if (this.running) {
      window.requestAnimationFrame(this.render)
    }
  }
}

export default Game
