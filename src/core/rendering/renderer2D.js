
import RoomMate from '@/core/interfaces/RoomMate'

class Renderer2D extends RoomMate {
  constructor(room) {
    super(room)
  }
  
  init(canvas) {
    if (!canvas) return
    const context = canvas.getContext('2d')
    context.mozImageSmoothingEnabled = false
    context.webkitImageSmoothingEnabled = false
    context.msImageSmoothingEnabled = false
    context.imageSmoothingEnabled = false
  }

  update(dt) {
  }

  render(context, canvas) {
    if (!canvas) return
    context.clearRect(0, 0, canvas.width, canvas.height)
  }
}

export default Renderer2D
