export const deepCopy = data => JSON.parse(JSON.stringify(data))
export const deepCompare = (a, b) => JSON.stringify(a) === JSON.stringify(b)
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
export const roundToNearest = (value, nearest) => Math.round(value / nearest) * nearest
export const getMultiple = (value, multiple) => Math.floor(value / multiple)

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
