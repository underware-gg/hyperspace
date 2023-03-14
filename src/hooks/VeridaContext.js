import React, { createContext, useReducer, useContext, useEffect } from 'react'
import { useVeridaProfile } from '@/hooks/useVeridaProfile'

//--------------------------------
// Context
//
export const initialState = {
  VeridaUser: null,
  getPublicProfile: null,
  isConnecting: false,
  isConnected: false,
  profile: null,
}
const VeridaContext = createContext(initialState)

const VeridaActions = {
  setVeridaUser: 'setVeridaUser',
  setGetPublicProfile: 'setGetPublicProfile',
  setIsConnecting: 'setIsConnecting',
  setIsConnected: 'setIsConnected',
  setProfile: 'setProfile',
}

//--------------------------------
// Provider
//
const VeridaProvider = ({
  children,
}) => {
  const [state, dispatch] = useReducer((state, action) => {
    let newState = { ...state }
    switch (action.type) {
      case VeridaActions.setVeridaUser:
        newState.VeridaUser = action.payload
        break
      case VeridaActions.setGetPublicProfile:
        newState.getPublicProfile = action.payload
        break
      case VeridaActions.setIsConnecting:
        newState.isConnecting = action.payload
        break
      case VeridaActions.setIsConnected:
        newState.isConnected = action.payload
        break
      case VeridaActions.setProfile:
        newState.profile = action.payload
        break
      default:
        console.warn(`VeridaProvider: Unknown action [${action.type}]`)
        return state
    }
    return newState
  }, initialState)

  const dispatchVerida = (type, payload) => {
    dispatch({ type, payload })
  }

  useEffect(() => {
    let _VeridaUser = null

    const _veridaConnected = async (profile) => {
      dispatchVerida(VeridaActions.setIsConnected, true)
      dispatchVerida(VeridaActions.setIsConnecting, false)
      dispatchVerida(VeridaActions.setProfile, profile)
    }

    const _veridaDisconnected = () => {
      dispatchVerida(VeridaActions.setIsConnected, false)
      dispatchVerida(VeridaActions.setIsConnecting, false)
      dispatchVerida(VeridaActions.setProfile, null)
    }

    const _veridaProfileChanged = (profile) => {
      dispatchVerida(VeridaActions.setProfile, profile)
    }

    const _initVerida = async () => {
      dispatchVerida(VeridaActions.setIsConnecting, true)

      const { VeridaUser, getPublicProfile } = (await import('@/core/verida'))
      dispatchVerida(VeridaActions.setVeridaUser, VeridaUser)
      dispatchVerida(VeridaActions.setGetPublicProfile, getPublicProfile)
      _VeridaUser = VeridaUser

      console.log(`VeridaUser.getPublicProfile`, VeridaUser.getPublicProfile)

      const isConnected = await VeridaUser.isConnected()
      if (isConnected) {
        const profile = await VeridaUser.getPublicProfile()
        await _veridaConnected(profile)
      }
      dispatchVerida(VeridaActions.setIsConnecting, false)

      _VeridaUser.on('connected', _veridaConnected)
      _VeridaUser.on('disconnected', _veridaDisconnected)
      _VeridaUser.on('profileChanged', _veridaProfileChanged)
    }

    _initVerida()

    return async () => {
      _VeridaUser?.off('connected', _veridaConnected)
      _VeridaUser?.off('disconnected', _veridaDisconnected)
      _VeridaUser?.off('profileChanged', _veridaProfileChanged)
    }
  }, [])

  return (
    <VeridaContext.Provider value={{ state, dispatch, dispatchVerida }}>
      {children}
    </VeridaContext.Provider>
  )
}

export { VeridaProvider, VeridaContext, VeridaActions }


//--------------------------------
// Hooks
//

export const useVeridaContext = () => {
  const { state, dispatchVerida } = useContext(VeridaContext)

  const connect = async () => {
    console.log(`Verida connect...`)
    dispatchVerida(VeridaActions.setIsConnecting, true)
    const success = await state.VeridaUser.connect()
    dispatchVerida(VeridaActions.setIsConnecting, false)
    console.log(`Verida connect status:`, success)
  }

  const disconnect = async () => {
    await state.VeridaUser.disconnect()
  }

  const getRoom = async () => {
    return await state.VeridaUser.getRoom(slug)
  }

  const saveRoom = async (slug) => {
    if (!clientRoom) return
    const snapshotOps = clientRoom.getSnapshotOps()
    await state.VeridaUser.saveRoom(slug, snapshotOps)
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
    await state.VeridaUser.sendMessage(recipientDid, subject, message, url, text)
  }

  const retrieveLastTweet = async () => {
    let _content = null
    await VeridaUser.retrieveLastTweet((content) => {
      _content = content
    })
    return _content
  }

  const did = state.VeridaUser?.did ?? null
  const didAddress = state.VeridaUser?.getDidAddress() ?? null

  return {
    veridaIsConnecting: state.isConnecting,
    veridaIsConnected: state.isConnected,
    veridaProfile: state.profile,
    did, didAddress,
    connect, disconnect,
    saveRoom, getRoom,
    inviteFriend,
    retrieveLastTweet,
    getPublicProfile: state.getPublicProfile,
    ...useVeridaProfile(state.profile, did),
  }
}
