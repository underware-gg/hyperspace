import { useState, useEffect, useMemo } from 'react'

const useVerida = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [profile, setProfile] = useState({})
  const [did, setDid] = useState(null)
  const [didAddress, setDidAddress] = useState(null)

  useEffect(() => {
    let _mounted = true

    const _veridaConnected = async (profile) => {
      const { VeridaUser } = (await import('src/core/networking/verida'))
      setIsConnected(true)
      setIsConnecting(false)
      setProfile(profile)
      setDid(VeridaUser.did)
      setDidAddress(VeridaUser.getDidAddress())
    }

    const _veridaDisconnected = () => {
      setIsConnected(false)
      setIsConnecting(false)
      setProfile({})
      setDid(null)
      setDidAddress(null)
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
        await _veridaConnected(profile)
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

  return {
    veridaIsConnected: isConnected,
    veridaIsInitializing: isConnecting,
    veridaProfile: profile,
    did,
    didAddress,
  }
}

export default useVerida
