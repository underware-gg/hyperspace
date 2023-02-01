import { useState, useEffect } from 'react'

const useVerida = (id) => {
  const [isConnected, setIsConnected] = useState(false)
  const [profile, setProfile] = useState({})

  useEffect(() => {
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
  }, [])

  return {
    veridaConnected: isConnected,
    veridaProfile: profile,
  }
}

export default useVerida
