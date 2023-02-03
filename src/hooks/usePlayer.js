import { useState, useEffect } from 'react'
import {
  getPortalOverPlayer,
  getScreenOverPlayer,
  getBookOverPlayer,
  getPlayerTile,
} from '@/core/components/player'
import useDocument from '@/hooks/useDocument'
import useDocumentIds from '@/hooks/useDocumentIds'

const usePlayer = (id) => {
  const player = useDocument('player', id)
  const [portalId, setPortalId] = useState(null)
  const [screenId, setScreenId] = useState(null)
  const [bookId, setBookId] = useState(null)
  const [playerTile, setPlayerTile] = useState(null)

  const portal = useDocument('portal', portalId)

  const portalIds = useDocumentIds('portal')
  const bookIds = useDocumentIds('book')
  const screenIds = useDocumentIds('screen')

  useEffect(() => {
    if (player) {
      setPortalId(getPortalOverPlayer(id))
      setScreenId(getScreenOverPlayer(id))
      setBookId(getBookOverPlayer(id))
      setPlayerTile(getPlayerTile(id))
    } else {
      setPortalId(null)
      setScreenId(null)
      setBookId(null)
      setPlayerTile(null)
    }
  }, [player?.position?.x, player?.position?.y, portalIds.length, bookIds.length, screenIds.length])

  return {
    portalId,
    portalName: portal?.slug ?? null,
    screenId,
    bookId,
    documentId: 'world',
    overPortal: portalId != null,
    overScreen: screenId != null,
    overBook: bookId != null,
    canPlace: (portalId == null && screenId == null && bookId == null),
    tileX: playerTile?.tileX ?? null,
    tileY: playerTile?.tileY ?? null,
  }
}

export default usePlayer
