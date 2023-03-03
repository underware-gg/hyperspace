export const deepCopy = (obj) => JSON.parse(JSON.stringify(obj))

export const getPrimitive = (value) => {
  if (value === null) {
    return 'null'
  }
  if (Array.isArray(value)) {
    return 'array'
  }
  switch (typeof value) {
    case 'string':
      return 'string'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'object':
      return 'object'
    default:
      throw new Error(`Unsupported type: ${typeof value}`)
  }
}

export const getPaths = (type, paths = [], path = []) => {
  let currentPrimitive = getPrimitive(type)

  if (currentPrimitive === 'string') {
    paths.push(deepCopy(path))
    return paths
  }

  if (currentPrimitive === 'object') {
    paths.push(deepCopy(path))

    for (const key in type) {
      const newPath = deepCopy(path)
      newPath.push(key)
      getPaths(type[key], paths, newPath)
    }

    return paths
  }

  if (currentPrimitive === 'array') {
    paths.push(deepCopy(path))

    for (let i = 0; i < type.length; i++) {
      const newPath = deepCopy(path)
      newPath.push(i)
      getPaths(type[i], paths, newPath)
    }

    return paths
  }

  throw new Error(`Unsupported type def: ${currentPrimitive}`)
}

export const getIndices = (paths) => {
  const indices = {}

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]
    const pathString = `/${path.join('.')}`
    indices[pathString] = i
  }

  return indices
}

export const getParentIndices = (indices, paths) => {
  const parentIndices = []

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]
    const parentPathIndices = []
    for (let j = path.length - 1; j > -1; j--) {
      const parentPath = path.slice(0, j)
      const parentPathString = `/${parentPath.join('.')}`
      const parentPathIndex = indices[parentPathString]
      parentPathIndices.push(parentPathIndex)
    }
    parentIndices.push(parentPathIndices)
  }

  return parentIndices
}

export const getNestedChildIndices = (paths, parentIndices) => {
  const childIndices = []

  for (let i = 0; i < paths.length; i++) {
    childIndices.push([])
  }

  for (let i = 0; i < parentIndices.length; i++) {
    const parentIndex = parentIndices[i]
    for (let j = 0; j < parentIndex.length; j++) {
      const parent = parentIndex[j]
      childIndices[parent].push(i)
    }
  }

  return childIndices
}

export const createTypeMetadata = (type) => {
  const paths = getPaths(type)
  const indices = getIndices(paths)
  const parentIndices = getParentIndices(indices, paths)
  const childIndices = getNestedChildIndices(paths, parentIndices)

  return {
    paths,
    indices,
    parentIndices,
    childIndices,
  }
}

export const player = {
  position: {
    x: 'number',
    y: 'number',
    z: 'number',
  },
  rotation: {
    x: 'number',
    y: 'number',
    z: 'number',
  },
}

export const profile = {
  name: 'string',
  spritesheet: 'string',
  blob: 'string',
}

export const settings = {
  size: { // map size in tiles
    width: 'number',
    height: 'number',
  },
  entry: { // default entry tile
    x: 'number',
    y: 'number',
  },
}

export const map = [
  ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
  ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
  ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
  ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
  ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
  ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
  ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
  ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
  ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
  ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
  ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
  ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
  ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
  ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
  ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
]

export const editor = {
  position: {
    x: 'number',
    y: 'number',
  },
  interacting: 'boolean',
}

export const portal = {
  position: {
    x: 'number',
    y: 'number',
    z: 'number',
  },
  slug: 'string',
  tile: {
    x: 'number',
    y: 'number',
  },
}

export const tileset = {
  name: 'string',
  blob: 'string',
  size: {
    width: 'number',
    height: 'number',
  },
}

export const screen = {
  name: 'string',
  type: 'string',
  content: 'string',
  page: 'number',   // page, slide, item, scroll position, etc, but value range is always 0 to 1
  position: {
    x: 'number',
    y: 'number',
    z: 'number',
  },
  rotation: {
    x: 'number',
    y: 'number',
    z: 'number',
  },
}

export const permission = {
  id: 'string',       // document id
  owner: 'string',    // owner address
  visible: 'boolean', // anyone can view
  public: 'boolean',  // anyone can edit
}

export const trigger = {
  name: 'string',
  state: 'number',
  data: 'string', // serialized json
  position: {
    x: 'number',
    y: 'number',
    z: 'number',
  },
}

// generic document
export const document = {
  content: 'string',
}

export const book = { // deprecated
  position: {
    x: 'number',
    y: 'number',
    z: 'number',
  },
  text: 'string',
}

export const typeDefs = {
  player: createTypeMetadata(player),
  profile: createTypeMetadata(profile),
  settings: createTypeMetadata(settings),
  map: createTypeMetadata(map),
  editor: createTypeMetadata(editor),
  portal: createTypeMetadata(portal),
  tileset: createTypeMetadata(tileset),
  screen: createTypeMetadata(screen),
  permission: createTypeMetadata(permission),
  trigger: createTypeMetadata(trigger),
  document: createTypeMetadata(document),
  // deprecated
  book: createTypeMetadata(book),
}
