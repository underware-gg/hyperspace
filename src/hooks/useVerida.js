import { useState, useEffect, useMemo } from 'react'

const useVerida = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [profile, setProfile] = useState({})
  const [did, setDid] = useState(null)

  useEffect(() => {
    let _mounted = true

    const _veridaConnected = (profile, did) => {
      setIsConnected(true)
      setIsConnecting(false)
      setProfile(profile)
      setDid(did)
    }

    const _veridaDisconnected = () => {
      setIsConnected(false)
      setIsConnecting(false)
      setProfile({})
      setDid(null)
    }

    const _veridaProfileChanged = (profile) => {
      setProfile(profile)
    }

    const _initVerida = async () => {
      setIsConnecting(true)
      const { VeridaUser } = (await import('src/core/networking/verida'))
      const isConnected = await VeridaUser.isConnected()
      if (isConnected) {
        const profile = await VeridaUser.getPublicProfile()
        _veridaConnected(profile, VeridaUser.did)
      } else {
        setIsConnecting(false)
      }

      if (_mounted) {
        VeridaUser.on('connected', _veridaConnected)
        VeridaUser.on('disconnected', _veridaDisconnected)
        VeridaUser.on('profileChanged', _veridaProfileChanged)
      }
    }

    _initVerida()

    return async () => {
      _mounted = false
      const { VeridaUser } = (await import('src/core/networking/verida'))
      VeridaUser.off('connected', _veridaConnected)
      VeridaUser.off('disconnected', _veridaDisconnected)
      VeridaUser.off('profileChanged', _veridaProfileChanged)
    }
  }, [])

  const didAddress = useMemo(() => (did?.split(':')?.slice(-1)?.[0] ?? null), [did])

  return {
    veridaIsConnected: isConnected,
    veridaIsInitializing: isConnecting,
    veridaProfile: profile,
    did,
    didAddress,
  }
}

export default useVerida
