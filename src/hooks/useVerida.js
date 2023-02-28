import { useState, useEffect, useMemo } from 'react'
import { useVeridaProfile } from './useVeridaProfile'

const useVerida = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [profile, setProfile] = useState(null)
  const [playerName, setPlayerName] = useState(null)
  const [playerImageUrl, setPlayerImageUrl] = useState(null)
  const [did, setDid] = useState(null)
  const [didAddress, setDidAddress] = useState(null)

  const connect = async () => {
    const { VeridaUser } = (await import('@/core/verida'))
    console.log(`connect...`)
    setIsConnecting(true);
    const success = await VeridaUser.connect()
    setIsConnecting(false);
    console.log(`connect status:`, success)
  }

  const disconnect = async () => {
    const { VeridaUser } = (await import('@/core/verida'))
    await VeridaUser.disconnect()
  }

  const inviteFriend = async () => {
    const recipientDid = window.prompt('DID to invite', 'did:vda:....')
    if (!recipientDid) {
      return
    }
    const subject = `Hyperbox invite!`
    const message = `Join me in ${slug} on Hyperbox`
    // @todo: Get app URL from next.js
    const url = `http://192.168.68.124:3000/${slug}`
    const text = `Open (${slug})`
    const { VeridaUser } = (await import('@/core/verida'))
    await VeridaUser.sendMessage(recipientDid, subject, message, url, text)
  }

  useEffect(() => {
    let _mounted = true

    const _veridaConnected = async (profile) => {
      const { VeridaUser } = (await import('@/core/verida'))
      setIsConnected(true)
      setIsConnecting(false)
      setProfile(profile)
      setDid(VeridaUser.did)
      setDidAddress(VeridaUser.getDidAddress())
    }

    const _veridaDisconnected = () => {
      setIsConnected(false)
      setIsConnecting(false)
      setProfile(null)
      setDid(null)
      setDidAddress(null)
    }

    const _veridaProfileChanged = (profile) => {
      setProfile(profile)
    }

    const _initVerida = async () => {
      setIsConnecting(true)
      const { VeridaUser } = (await import('@/core/verida'))
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
      const { VeridaUser } = (await import('@/core/verida'))
      VeridaUser.off('connected', _veridaConnected)
      VeridaUser.off('disconnected', _veridaDisconnected)
      VeridaUser.off('profileChanged', _veridaProfileChanged)
    }
  }, [])

  return {
    connect, disconnect, inviteFriend,
    veridaIsConnecting: isConnecting,
    veridaIsConnected: isConnected,
    veridaProfile: profile,
    did,
    didAddress,
    ...useVeridaProfile(profile, did),
  }
}

export default useVerida
