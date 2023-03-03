import { useState, useEffect } from 'react'
import {
  getPortalOverPlayer,
  getScreenOverPlayer,
  getPlayerTileRotation,
} from '@/core/components/player'
import { useDocument, useLocalDocument } from '@/hooks/useDocument'
import { useRemoteDocumentIds } from '@/hooks/useDocumentIds'

const usePlayer = (id) => {
  const player = useDocument('player', id)
  const [portalId, setPortalId] = useState(null)
  const [screenId, setScreenId] = useState(null)
  const [playerTile, setPlayerTile] = useState(null)

  const portal = useDocument('portal', portalId)
  const is3D = useLocalDocument('show-3d', 'world')

  const portalIds = useRemoteDocumentIds('portal')
  const screenIds = useRemoteDocumentIds('screen')

  useEffect(() => {
    if (player) {
      setPortalId(getPortalOverPlayer(id))
      setScreenId(getScreenOverPlayer(id))
      setPlayerTile(getPlayerTileRotation(id))
    } else {
      setPortalId(null)
      setScreenId(null)
      setPlayerTile(null)
    }
  }, [player?.position, player?.rotation, portalIds.length, screenIds.length, is3D])

  return {
    portalId,
    portalName: portal?.slug ?? null,
    screenId,
    overPortal: portalId != null,
    overScreen: screenId != null,
    canPlace: (portalId == null && screenId == null),
    tileX: playerTile?.x ?? null,
    tileY: playerTile?.y ?? null,
    rotation: playerTile?.rot ?? null,
  }
}

export default usePlayer
