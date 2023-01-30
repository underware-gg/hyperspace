import { useState, useEffect } from 'react'
import {
  getPortalOverPlayer,
  getScreenOverPlayer,
  getBookOverPlayer,
  getDocumentOverPlayer,
  getPlayerTile,
} from 'core/components/player'
import useDocument from 'hooks/use-document'
import useDocumentIds from 'hooks/use-document-ids'

const usePlayer = (id) => {
  const player = useDocument('player', id)
  const [portalId, setPortalId] = useState(null)
  const [screenId, setScreenId] = useState(null)
  const [bookId, setBookId] = useState(null)
  const [overDocument, setOverDocument] = useState(false)
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
      setOverDocument(getDocumentOverPlayer(id))
      setPlayerTile(getPlayerTile(id))
    } else {
      setPortalId(null)
      setScreenId(null)
      setBookId(null)
      setOverDocument(null)
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
    overDocument,
    canPlace: (portalId == null && screenId == null && bookId == null && !overDocument),
    tileX: playerTile?.tileX ?? null,
    tileY: playerTile?.tileY ?? null,
  }
}

export default usePlayer
