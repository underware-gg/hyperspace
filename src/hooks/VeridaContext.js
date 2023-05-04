import React, { createContext, useReducer, useContext, useEffect } from 'react'
import { useVeridaProfile } from '@/hooks/useVeridaProfile'
import { clientUrl } from '@/core/networking/config'

//--------------------------------
// Context
//
export const initialState = {
  VeridaUser: null,
  getPublicProfile: null,
  isConnecting: false,
  isConnected: false,
  profile: null,
  requestedSignIn: false,
}
const VeridaContext = createContext(initialState)

const VeridaActions = {
  setVeridaUser: 'setVeridaUser',
  setGetPublicProfile: 'setGetPublicProfile',
  setIsConnecting: 'setIsConnecting',
  setIsConnected: 'setIsConnected',
  setProfile: 'setProfile',
  setRequestSignIn: 'setRequestSignIn',
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
      case VeridaActions.setRequestSignIn:
        newState.requestedSignIn = action.payload
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

      _VeridaUser?.on('connected', _veridaConnected)
      _VeridaUser?.on('disconnected', _veridaDisconnected)
      _VeridaUser?.on('profileChanged', _veridaProfileChanged)

      try {
        const isConnected = await VeridaUser.isConnected()
        // .catch(e, () => {
        //   console.warn(`VeridaUser.isConnected() exception:`, e)
        //   throw new Error(e)
        // })
        if (isConnected) {
          const profile = await VeridaUser.getPublicProfile()
          // .catch(e, () => {
          //   console.warn(`VeridaUser.getPublicProfile() exception:`, e)
          //   throw new Error(e)
          // })
          await _veridaConnected(profile)
        }
      } catch (e) {
        console.warn(`VeridaContext exception:`, e)
      }

      dispatchVerida(VeridaActions.setIsConnecting, false)
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

  const download = () => {
    window.open('https://www.verida.io/', '_blank', 'noreferrer')
  }

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

  const saveData = async (id, data) => {
    return await state.VeridaUser.saveData(id, data)
  }

  const restoreData = async (id) => {
    return await state.VeridaUser.restoreData(id)
  }

  const inviteFriend = async (slug) => {
    const recipientDid = window.prompt('DID to invite', 'did:vda:....')
    if (!recipientDid) {
      return
    }
    const subject = `Hyperbox invite!`
    const message = `Join me in ${slug} on Hyperbox`
    // @todo: Get app URL from next.js
    const url = `${clientUrl}/${slug}`
    const text = `Open (${slug})`
    await state.VeridaUser.sendMessage(recipientDid, subject, message, url, text)
  }

  const retrieveLastTweet = async () => {
    let result = null
    await state.VeridaUser?.retrieveLastTweet((content) => {
      result = content
    })
    return result
  }

  const did = state.VeridaUser?.did ?? null
  const didAddress = state.VeridaUser?.getDidAddress() ?? null

  return {
    dispatchVerida,
    veridaIsConnecting: state.isConnecting,
    veridaIsConnected: state.isConnected,
    veridaProfile: state.profile,
    requestedSignIn: state.requestedSignIn,
    did, didAddress,
    download,
    connect, disconnect,
    saveData, restoreData,
    inviteFriend,
    retrieveLastTweet,
    getPublicProfile: state.getPublicProfile,
    ...useVeridaProfile(state.profile, did),
  }
}
