import React, { useState, useEffect } from 'react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useRemoteDocument, useSessionDocument } from '@/hooks/useDocument'
import { useRemoteDocumentIds } from '@/hooks/useDocumentIds'
import useProfile from '@/hooks/useProfile'

const usePlayer = (id) => {
  const { Player } = useRoomContext()
  const player = useSessionDocument('player', id)
  const [portalId, setPortalId] = useState(null)
  const [triggerId, setTriggerId] = useState(null)
  const [screenId, setScreenId] = useState(null)
  const [playerTile, setPlayerTile] = useState(null)

  const portal = useRemoteDocument('portal', portalId)
  const trigger = useRemoteDocument('trigger', triggerId)
  const screen = useRemoteDocument('screen', screenId)
  const { view3d } = useProfile()

  const portalIds = useRemoteDocumentIds('portal')
  const triggerIds = useRemoteDocumentIds('trigger')
  const screenIds = useRemoteDocumentIds('screen')

  useEffect(() => {
    if (player && Player) {
      setPortalId(Player.getPortalOverPlayer(id))
      setTriggerId(Player.getTriggerOverPlayer(id))
      setScreenId(Player.getScreenOverPlayer(id))
      setPlayerTile(Player.getPlayerTileRotation(id))
    } else {
      setPortalId(null)
      setTriggerId(null)
      setScreenId(null)
      setPlayerTile(null)
    }
  }, [player?.position, player?.rotation, portalIds, triggerIds, screenIds, view3d, Player])

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
