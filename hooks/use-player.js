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

      const VeridaApi = (await import('core/networking/verida')).VeridaApi
      VeridaApi.on('profileChanged', (profile) => {
        setProfile(profile)
      })
    }

    const initVerida = async () => {
      const VeridaApi = (await import('core/networking/verida')).VeridaApi
      const isConnected = await VeridaApi.isConnected()
      if (isConnected) {
        const profile = await VeridaApi.getPublicProfile()
        veridaConnected(profile)
      }

      VeridaApi.on('connected', (profile) => {
        veridaConnected(profile)
      })
    }
    
    initVerida()
  }, [player])

  return {
    portalId,
    bookId,
    playerConnected: isConnected,
    playerProfile: profile,
    overPortal: portalId != null,
    overBook: bookId != null,
    overDocument,
    canPlace: (portalId == null && bookId == null && !overDocument),
  }
}

export default usePlayer
