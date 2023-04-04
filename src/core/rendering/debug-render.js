export const strokeRect = (ctx, rect) => {
  ctx.beginPath()
  ctx.lineWidth = 0.05
  ctx.strokeStyle = 'red'

  ctx.rect(
    rect.position.x,
    rect.position.y,
    rect.size.width,
    rect.size.height,
  )

  ctx.stroke()
}

export const strokeCircle = (ctx, circle) => {
  ctx.beginPath()
  ctx.lineWidth = 0.05
  ctx.strokeStyle = 'red'

  ctx.arc(
    circle.position.x,
    circle.position.y,
    circle.radius,
    0,
    2 * Math.PI,
  )

  ctx.stroke()
}
