import { useState, useEffect } from 'react'

const useVerida = (id) => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [profile, setProfile] = useState({})

  useEffect(() => {
    let _mounted = true

    const _veridaConnected = (profile) => {
      setIsConnected(true)
      setIsConnecting(false)
      setProfile(profile)
    }

    const _veridaDisconnected = () => {
      setIsConnected(false)
      setIsConnecting(false)
      setProfile({})
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
        _veridaConnected(profile)
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
  }
}

export default useVerida
