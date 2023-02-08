import { useState, useEffect, useMemo } from 'react'
import useVerida from '@/hooks/useVerida'

const useVeridaPublicProfile = (didAddress) => {
  const { veridaIsConnected } = useVerida()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    let _mounted = true

    const _getProfile = async () => {
      const { getPublicProfile } = (await import('src/core/networking/verida'))
      const publicProfile = await getPublicProfile(didAddress);
      if (_mounted) {
        setProfile(publicProfile)
      }
    }

    if (veridaIsConnected && didAddress) {
      _getProfile()
    } else {
      setProfile(null)
    }

    return async () => {
      _mounted = false
    }
  }, [veridaIsConnected, didAddress])

  return {
    publicProfile: profile,
  }
}

export default useVeridaPublicProfile
