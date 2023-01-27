import { useState, useEffect } from 'react'
import { getPortalOverPlayer, getBookOverPlayer, getDocumentOverPlayer } from 'core/components/player'
import useDocument from 'hooks/use-document'

const usePlayer = (id) => {
  const player = useDocument('player', id)
  const [portalId, setPortalId] = useState(null)
  const [bookId, setBookId] = useState(null)
  const [overDocument, setOverDocument] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [profile, setProfile] = useState({})

  const portal = useDocument('portal', portalId)

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

    const veridaConnected = async (profile) => {
      if (isConnected) {
        return
      }

      setIsConnected(true)
      setProfile(profile)

      const VeridaUser = (await import('core/networking/verida')).VeridaUser
      VeridaUser.on('profileChanged', (profile) => {
        setProfile(profile)
      })
    }

    const initVerida = async () => {
      const VeridaUser = (await import('core/networking/verida')).VeridaUser
      const isConnected = await VeridaUser.isConnected()
      if (isConnected) {
        const profile = await VeridaUser.getPublicProfile()
        veridaConnected(profile)
      }

      VeridaUser.on('connected', (profile) => {
        veridaConnected(profile)
      })

      VeridaUser.on('disconnected', () => {
        setIsConnected(false)
      })
    }
    
    initVerida()
  }, [player])

  return {
    playerConnected: isConnected,
    playerProfile: profile,
    portalId,
    portalName: portal?.slug ?? null,
    bookId,
    documentId: 'world',
    overPortal: portalId != null,
    overBook: bookId != null,
    overDocument,
    canPlace: (portalId == null && bookId == null && !overDocument),
  }
}

export default usePlayer
