import { loadTextures } from './textures'
import Renderer2D from './rendering/renderer2D'
import Renderer3D from './rendering/renderer3D'
import * as Room from './room'

class Game {
  constructor() {
    this.lastTime = (new Date()).getTime()
    this.currentTime = 0
    this.dt = 0

    this.init = this.init.bind(this)
    this.shutdown = this.shutdown.bind(this)
    this.update = this.update.bind(this)
    this.render = this.render.bind(this)
    this.renderer2D = new Renderer2D()
    this.renderer3D = new Renderer3D()
  }

  async init(slug, canvas, canvas3d) {
    this.canvas = canvas
    this.context = canvas.getContext('2d')
    this.canvas3d = canvas3d

    await loadTextures()

    this.renderer2D.init(this.context)
    this.renderer3D.init(canvas3d)
    Room.init(slug, canvas, canvas3d)

    this.lastTime = (new Date()).getTime()
    this.currentTime = 0
    this.dt = 0

    this.running = true
    window.requestAnimationFrame(this.update)
  }

  shutdown() {
    this.running = false
  }

  update() {
    this.currentTime = (new Date()).getTime()
    this.dt = (this.currentTime - this.lastTime) / 1000

    this.renderer2D.update(this.dt)
    this.renderer3D.update(this.dt)
    Room.update(this.dt)
  
    this.render()
  
    this.lastTime = this.currentTime
  
    if (this.running) {
      window.requestAnimationFrame(this.update)
    }
  }

  render() {
    this.renderer2D.render(this.canvas, this.context)
    this.renderer3D.render()
    Room.render(this.canvas, this.context)
  }
}

export default Game
