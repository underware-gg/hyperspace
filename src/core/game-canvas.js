import { getLocalStore } from '@/core/singleton'

export const getGameCanvasElement = (is3d = null) => {
  if (is3d === null) {
    const localStore = getLocalStore()
    is3d = localStore.getDocument('show-3d', 'world') ?? false
  }
  return document.getElementById(is3d ? 'game3D' : 'game')
}

export const focusGameCanvas = () => {
  getGameCanvasElement()?.focus()
}
