import { getLocalStore } from '@/core/singleton'

export const getGameCanvasElement = () => {
  const localStore = getLocalStore()
  const is3d = localStore.getDocument('show-3d', 'world') ?? false
  if (is3d) {
    return document.getElementById('game3D')
  }
  return document.getElementById('game')
}

export const focusGameCanvas = () => {
  getGameCanvasElement()?.focus()
}
