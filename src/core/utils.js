export class CONST {
  static PI = Math.PI;
  static TWO_PI = Math.PI * 2;
  static HALF_PI = Math.PI * 0.5;
  static QUATER_PI = Math.PI * 0.25;
}

export const deepCopy = data => JSON.parse(JSON.stringify(data))
export const deepCompare = (a, b) => JSON.stringify(a) === JSON.stringify(b)
export const roundToNearest = (value, nearest) => Math.round(value / nearest) * nearest
export const lerp = (v, min, max) => (min + (max - min) * v)
export const map = (v, inMin, inMax, outMin, outMax) => (outMin + (outMax - outMin) * ((v - inMin) / (inMax - inMin)))
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
export const clampRadians = (angle) => {
  let result = angle
  while (result < 0) result += CONST.TWO_PI
  while (result > CONST.TWO_PI) result -= CONST.TWO_PI
  return result
}

export const getFilenameFromUrl = (url) => {
  return url?.split('/')?.slice(-1)?.[0] ?? null
}

export const getFilenameExtensionFromUrl = (url) => {
  const filename = getFilenameFromUrl(url)
  if(!filename) return null
  const parts = filename.split('.')
  return parts.length >= 2 ? parts.slice(-1)[0].toLowerCase() : null
}


export const throttle = (cb, delay = 1000) => {
  let shouldWait = false
  let waitingArgs
  const timeoutFunc = () => {
    if (waitingArgs == null) {
      shouldWait = false
    } else {
      cb(...waitingArgs)
      waitingArgs = null
      setTimeout(timeoutFunc, delay)
    }
  }

  return (...args) => {
    if (shouldWait) {
      waitingArgs = args
      return
    }

    cb(...args)
    shouldWait = true
    setTimeout(timeoutFunc, delay)
  }
}

const isObject = (item) => {
  return (item && typeof item === 'object' && !Array.isArray(item));
}
export const deepMerge = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, {
          [key]: {}
        });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, {
          [key]: source[key]
        });
      }
    }
  }
  return deepMerge(target, ...sources);
}

export const hashCode = function (s) {
  return s.split('').reduce(function (a, b) {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
}

export const validateRoomSlug = (slug) => {
  if (!slug) return false
  return /^[a-zA-Z0-9-+_]+$/.test(slug)
}
