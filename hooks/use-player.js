import { useState, useEffect } from 'react'
import {
  getPortalOverPlayer,
  getBookOverPlayer,
  getDocumentOverPlayer,
  getPlayerTile,
} from 'core/components/player'
import useDocument from 'hooks/use-document'
import useDocumentIds from 'hooks/use-document-ids'

const usePlayer = (id) => {
  const player = useDocument('player', id)
  const [portalId, setPortalId] = useState(null)
  const [bookId, setBookId] = useState(null)
  const [overDocument, setOverDocument] = useState(false)
  const [playerTile, setPlayerTile] = useState(null)

  const portal = useDocument('portal', portalId)

  const portalIds = useDocumentIds('portal')
  const bookIds = useDocumentIds('book')

  useEffect(() => {
    if (player) {
      setPortalId(getPortalOverPlayer(id))
      setBookId(getBookOverPlayer(id))
      setOverDocument(getDocumentOverPlayer(id))
      setPlayerTile(getPlayerTile(id))
    } else {
      setPortalId(null)
      setBookId(null)
      setOverDocument(null)
      setPlayerTile(null)
    }
  }, [player?.position?.x, player?.position?.y, portalIds.length, bookIds.length])

  return {
    portalId,
    portalName: portal?.slug ?? null,
    bookId,
    documentId: 'world',
    overPortal: portalId != null,
    overBook: bookId != null,
    overDocument,
    canPlace: (portalId == null && bookId == null && !overDocument),
    tileX: playerTile?.tileX ?? null,
    tileY: playerTile?.tileY ?? null,
  }
}

export default usePlayer
