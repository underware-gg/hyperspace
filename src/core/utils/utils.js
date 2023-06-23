export class CONST {
  static PI = Math.PI;
  static TWO_PI = Math.PI * 2;
  static HALF_PI = Math.PI * 0.5;
  static QUATER_PI = Math.PI * 0.25;
  static DEGREES_PER_RADIANS = (180 / Math.PI);
}

export const roundToNearest = (value, nearest) => Math.round(value / nearest) * nearest
export const lerp = (v, min, max) => (min + (max - min) * v)
export const map = (v, inMin, inMax, outMin, outMax) => (outMin + (outMax - outMin) * ((v - inMin) / (inMax - inMin)))
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export const toDegrees = (r) => (Math.floor(r * CONST.DEGREES_PER_RADIANS))
export const toRadians = (d) => (d / CONST.DEGREES_PER_RADIANS)
export const clampRadians = (angle) => {
  let result = angle
  while (result < 0) result += CONST.TWO_PI
  while (result > CONST.TWO_PI) result -= CONST.TWO_PI
  return result
}

export const hashCode = function (s) {
  return s.split('').reduce(function (a, b) {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
}

export const getFilenameFromUrl = (url) => {
  return url?.split('/')?.slice(-1)?.[0] ?? null
}

export const getFilenameExtensionFromUrl = (url) => {
  const filename = getFilenameFromUrl(url)
  if (!filename) return null
  const parts = filename.split('.')
  return parts.length >= 2 ? parts.slice(-1)[0].toLowerCase() : null
}

export const applyScrollProg = (outerDiv, innerDiv, scrollProg) => {
  if (outerDiv && innerDiv) {
    const outerHeight = Math.floor(outerDiv.clientHeight)
    const innerHeight = Math.floor(innerDiv.scrollHeight)
    const diff = (innerHeight - outerHeight)
    if (diff > 0) {
      outerDiv.scrollTo(0, diff * scrollProg)
    }
  }
}

export const getScrollProg = (outerDiv) => {
  const { scrollHeight, scrollTop, clientHeight } = outerDiv
  const scrollProg = scrollTop / (scrollHeight - clientHeight)
  return scrollProg
}
