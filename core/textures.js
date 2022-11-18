import * as THREE from 'three'

const textures = {}

export const loadTextures = async (texturesData) =>
  new Promise((resolve, reject) => {
    const images = {}
    texturesData.forEach(textureData => {
      const image = new Image()
      image.src = textureData.src
      image.onload = () => {
        images[textureData.name] = image
        textures[textureData.name] = image
        if (Object.keys(images).length === texturesData.length) {
          resolve(images)
        }
      }
    })
  })

export const getTextureByName = name => textures[name] || null

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
