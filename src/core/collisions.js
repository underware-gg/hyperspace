export const rectanglesOverlap = (rect, rect2) => {
  return (
    rect.position.x + rect.size.width >= rect2.position.x &&
    rect.position.x < rect2.position.x + rect2.size.width &&
    rect.position.y + rect.size.height >= rect2.position.y &&
    rect.position.y < rect2.position.y + rect2.size.height
  )
}

export const circleOverlapsRectangle = (circle, rect) => {
  const circleDistance = {
    x: Math.abs(circle.position.x - rect.position.x),
    y: Math.abs(circle.position.y - rect.position.y),
  }

  if (circleDistance.x > (rect.width * 0.5 + circle.radius)) {
    return false
  }

  if (circleDistance.y > (rect.height * 0.5 + circle.radius)) {
    return false
  }

  if (circleDistance.x <= rect.width * 0.5) {
    return true
  }

  if (circleDistance.y <= rect.height * 0.5) {
    return true
  }

  const cornerDistanceSq =
    Math.pow(circleDistance.x - rect.width * 0.5, 2) +
    Math.pow(circleDistance.y - rect.height * 0.5, 2)

  return (cornerDistanceSq <= Math.pow(circle.radius, 2))
}

export const circlesOverlap = (circle, circle2) => {
  return (
    Math.hypot(
      circle.position.x - circle2.position.x,
      circle.position.y - circle2.position.y
    ) <= circle.radius + circle2.radius
  )
}

// This assumes that the rect is smaller than the tile size.
// Otherwise we'd need to loop through each point between x1 and x2
// and y1 and y2.
export const getOverlappingTiles = (rect, tileSize) => {
  const tiles = []

  const { x, y } = rect.position
  const { width, height } = rect.size

  const x1 = Math.floor(x / tileSize)
  const y1 = Math.floor(y / tileSize)
  const x2 = Math.floor((x + width) / tileSize)
  const y2 = Math.floor((y + height) / tileSize)

  tiles.push({ x: x1, y: y1 })

  if (x1 !== x2) {
    tiles.push({ x: x2, y: y1 })
  }

  if (y1 !== y2) {
    tiles.push({ x: x1, y: y2 })
  }

  if (x1 !== x2 && y1 !== y2) {
    tiles.push({ x: x2, y: y2 })
  }

  return tiles
}
