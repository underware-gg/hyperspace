import { useState, useEffect } from 'react'
import {
  getPortalOverPlayer,
  getScreenOverPlayer,
  getPlayerTile,
} from '@/core/components/player'
import useDocument from '@/hooks/useDocument'
import useDocumentIds from '@/hooks/useDocumentIds'

const usePlayer = (id) => {
  const player = useDocument('player', id)
  const [portalId, setPortalId] = useState(null)
  const [screenId, setScreenId] = useState(null)
  const [playerTile, setPlayerTile] = useState(null)

  const portal = useDocument('portal', portalId)

  const portalIds = useDocumentIds('portal')
  const screenIds = useDocumentIds('screen')

  useEffect(() => {
    if (player) {
      setPortalId(getPortalOverPlayer(id))
      setScreenId(getScreenOverPlayer(id))
      setPlayerTile(getPlayerTile(id))
    } else {
      setPortalId(null)
      setScreenId(null)
      setPlayerTile(null)
    }
  }, [player?.position?.x, player?.position?.y, portalIds.length, screenIds.length])

  return {
    portalId,
    portalName: portal?.slug ?? null,
    screenId,
    overPortal: portalId != null,
    overScreen: screenId != null,
    canPlace: (portalId == null && screenId == null),
    tileX: playerTile?.tileX ?? null,
    tileY: playerTile?.tileY ?? null,
  }
}

export default usePlayer
