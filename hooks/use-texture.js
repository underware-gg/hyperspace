import { useState, useEffect } from 'react'
import { getTextureByName, getSprite } from '../core/textures'

const useTexture = (textureName) => {
  const [texture, setTexture] = useState(null)
  const [sprite, setSprite] = useState(null)

  useEffect(() => {
    async function _getTexture() {
      const tex = getTextureByName(textureName)
      if (tex) {
        setTexture(tex)
        setSprite(getSprite(textureName))
      } else {
        setTimeout(_getTexture, 100)
      }
    }
    _getTexture()
  }, [textureName])

  return { texture, sprite }
}

export default useTexture
