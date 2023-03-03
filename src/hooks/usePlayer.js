import { useState, useEffect } from 'react'
import {
  getPortalOverPlayer,
  getTriggerOverPlayer,
  getScreenOverPlayer,
  getPlayerTileRotation,
} from '@/core/components/player'
import { useDocument, useLocalDocument } from '@/hooks/useDocument'
import { useRemoteDocumentIds } from '@/hooks/useDocumentIds'

const usePlayer = (id) => {
  const player = useDocument('player', id)
  const [portalId, setPortalId] = useState(null)
  const [triggerId, setTriggerId] = useState(null)
  const [screenId, setScreenId] = useState(null)
  const [playerTile, setPlayerTile] = useState(null)

  const portal = useDocument('portal', portalId)
  const trigger = useDocument('trigger', triggerId)
  const screen = useDocument('screen', screenId)
  const is3D = useLocalDocument('show-3d', 'world')

  const portalIds = useRemoteDocumentIds('portal')
  const triggerIds = useRemoteDocumentIds('trigger')
  const screenIds = useRemoteDocumentIds('screen')

  useEffect(() => {
    if (player) {
      setPortalId(getPortalOverPlayer(id))
      setTriggerId(getTriggerOverPlayer(id))
      setScreenId(getScreenOverPlayer(id))
      setPlayerTile(getPlayerTileRotation(id))
    } else {
      setPortalId(null)
      setTriggerId(null)
      setScreenId(null)
      setPlayerTile(null)
    }
  }, [player?.position, player?.rotation, portalIds, triggerIds, screenIds, is3D])

  return {
    portalId, portal,
    portalName: portal?.slug ?? null,
    triggerId, trigger,
    triggerName: trigger?.name ?? null,
    screenId, screen,
    screenName: screen?.name ?? null,
    overPortal: portalId != null,
    overTrigger: triggerId != null,
    overScreen: screenId != null,
    canPlace: (portalId == null && triggerId == null && screenId == null),
    tileX: playerTile?.x ?? null,
    tileY: playerTile?.y ?? null,
    rotation: playerTile?.rot ?? null,
  }
}

export default usePlayer
