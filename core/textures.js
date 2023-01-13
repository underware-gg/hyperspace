import * as THREE from 'three'
import { textureData } from './texture-data'

const textures = {}

export const loadTextures = async () =>
  new Promise((resolve, reject) => {
    let imagesToLoad = Object.keys(textureData).length;
    Object.keys(textureData).forEach((name) => {
      const td = textureData[name]
      const image = new Image()
      image.src = td.src
      image.onload = () => {
        textures[name] = image
        if (--imagesToLoad == 0) {
          resolve()
        }
      }
    });
  })

export const getTextureByName = name => textures[name] ?? null

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
