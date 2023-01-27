export class CONST {
  static PI = Math.PI;
  static TWO_PI = Math.PI * 2;
  static HALF_PI = Math.PI * 0.5;
  static QUATER_PI = Math.PI * 0.25;
}

export const deepCopy = data => JSON.parse(JSON.stringify(data))
export const deepCompare = (a, b) => JSON.stringify(a) === JSON.stringify(b)
export const roundToNearest = (value, nearest) => Math.round(value / nearest) * nearest
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
export const clampRadians = (angle) => {
  let result = angle
  while (result < 0) result += CONST.TWO_PI
  while (result > CONST.TWO_PI) result -= CONST.TWO_PI
  return result
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
