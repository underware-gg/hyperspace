import React, { useState, useEffect, useMemo } from 'react'
import { useVeridaContext } from '@/hooks/VeridaContext'

export const useVeridaProfile = (profile, did=null) => {
  const hasVeridaProfile = (profile != null)
  return {
    hasVeridaProfile,
    veridaProfileName: profile?.name ?? null,
    veridaAvatarUri: profile?.avatarUri ?? profile?.avatar?.uri ?? null,
    veridaProfileUrl: (hasVeridaProfile && did) ? `https://demo.verida.one/${did}` : null,
  }
}

export const useVeridaPublicProfile = (didAddress) => {
  const { veridaIsConnected, getPublicProfile } = useVeridaContext()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    let _mounted = true

    const _getProfile = async () => {
      const publicProfile = await getPublicProfile(didAddress)
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

  const did = `did:vda:testnet:${didAddress}`

  return useVeridaProfile(profile, did)
}
