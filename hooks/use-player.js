import { useState, useEffect } from 'react'
import { getPortalOverPlayer, getBookOverPlayer, getDocumentOverPlayer } from 'core/components/player'
import useDocument from 'hooks/use-document'

const usePlayer = (id) => {
  const player = useDocument('player', id)
  const [portalId, setPortalId] = useState(null)
  const [bookId, setBookId] = useState(null)
  const [overDocument, setOverDocument] = useState(false)

  useEffect(() => {
    if (player) {
      setPortalId(getPortalOverPlayer(id))
      setBookId(getBookOverPlayer(id))
      setOverDocument(getDocumentOverPlayer(id))
    } else {
      setPortalId(null)
      setBookId(null)
      setOverDocument(null)
    }
  }, [player])

  return {
    portalId,
    bookId,
    overPortal: portalId != null,
    overBook: bookId != null,
    overDocument,
    canPlace: (portalId == null && bookId == null && !overDocument),
    }
}

export default usePlayer
