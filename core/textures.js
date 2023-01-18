import * as THREE from 'three'
import { textureData, spritesheets } from './texture-data'
import { deepCopy } from '/core/merge/tiny-merge'

const textures = {}

export const loadTextures = async () =>
  new Promise((resolve, reject) => {
    let _textureData = deepCopy(textureData)
    for(const sheet of spritesheets) {
      _textureData[sheet.src] = sheet
    }
    let imagesToLoad = Object.keys(_textureData).length
    Object.keys(_textureData).forEach((name) => {
      const td = _textureData[name]
      const image = new Image()
      image.src = td.src
      image.onload = () => {
        textures[name] = {
          ...td,
          scale: td.scale ?? 1,
          width: image.width,
          height: image.height,
          aspect: image.width / image.height,
          image,
        }
        if (td.sprites) {
          const width = image.width / td.sprites.columns
          const height = image.height / td.sprites.rows
          let boxes = []
          for (let x = 0; x < image.width; x += width) {
            let col = []
            for (let y = 0; y < image.height; y += height) {
              col.push([x, y])
            }
            boxes.push(col)
          }
          textures[name].sprites = {
            ...td.sprites,
            width,
            height,
            boxes,
          }
        }
        if (--imagesToLoad == 0) {
          resolve()
        }
      }
    })
  })

export const getTextureByName = name => textures[name] ?? null
export const getTextureImageByName = name => textures[name]?.image ?? null

export const getSprite = (textureName, stepX = 0.0, stepY = 0.0, cycleName = 'idle') => {
  const texture = getTextureByName(textureName)

  if (!texture) {
    return null
  }

  if (!texture.sprites) {
    return {
      pixel: {
        start: [0, 0],
        end: [texture.width, texture.height]
      },
      uv: {
        start: [0, 0],
        end: [1, 1]
      },
    }
  }
  
  let step = 0.0

  if (cycleName == 'walkLeft' || cycleName == 'walkRight') {
    step = (stepX % 1.0)
  } else if (cycleName == 'walkRight' || cycleName == 'walkDown') {
    step = (stepY % 1.0)
  }

  const cycle = texture.sprites.cycles?.[cycleName] ?? null
  step = Math.floor(step * (cycle?.length ?? 1))

  const aspect = texture.sprites.width / texture.sprites.height;

  const dx = 1.0 / texture.sprites.columns
  const dy = 1.0 / texture.sprites.rows

  const coord = cycle?.[step] ?? [0, 0]

  const uv = {
    start: [coord[0] * dx, coord[1] * dy],
    end: [(coord[0] + 1) * dx, (coord[1] + 1) * dy],
  }

  const pixel = {
    start: [coord[0] * texture.sprites.width, coord[1] * texture.sprites.height],
    end: [(coord[0] + 1) * texture.sprites.width, (coord[1] + 1) * texture.sprites.height],
  }

  // css img clip-path
  const left = Math.floor(uv.start[0] * 100);
  const right = Math.floor((1.0 - uv.end[0]) * 100);
  const top = Math.floor(uv.start[1] * 100);
  const bottom = Math.floor((1.0 - uv.end[1]) * 100);
  const scaleY = ((32 / texture.sprites.height) / dy);
  const scaleX = scaleY * texture.aspect;
  const imgStyle = {
    transform: ` translate(-50%, -50%) scale(${scaleX}, ${scaleY}) translate(50%, 50%) translate(${left}%, ${top}%)`,
    clipPath: `inset(${top}% ${right}% ${bottom}% ${left}%)`,
  }

  return {
    cycleName,
    aspect,
    coord,
    pixel,
    uv,
    imgStyle,
  }
}

export const createRenderTexture = (width, height) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = width
  canvas.height = height

  const texture = new THREE.CanvasTexture(canvas)

  return {
    canvas,
    context,
    texture,
    width,
    height,
  }
}

// Currently only accepts png.
export const fromSourceToDataURL = (src) => (
  new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'Anonymous'
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = image.width
      canvas.height = image.height
      context.drawImage(image, 0, 0)
      const dataUrl = canvas.toDataURL('image/png')
      resolve({ dataUrl, width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = () => {
      reject()
    }
    image.src = src
  })
)
