import React, { createContext, useReducer, useContext } from 'react'

//--------------------------------
// Context
//
export const initialState = {
  room: null,
}
const RoomContext = createContext(initialState)

const RoomActions = {
  SET_ROOM: 'SET_ROOM',
}

//--------------------------------
// Provider
//
const RoomProvider = ({
  children,
}) => {
  const [state, dispatch] = useReducer((state, action) => {
    let newState = { ...state }
    switch (action.type) {
      case RoomActions.SET_ROOM:
        newState.room = action.payload
        break
      default:
        console.warn(`RoomProvider: Unknown action [${action.type}]`)
        return state
    }
    return newState
  }, initialState)

  // const dispatchRoom = (type, payload) => {
  //   dispatch({ type, payload })
  // }

  const dispatchRoom = (room) => {
    dispatch({
      type: RoomActions.SET_ROOM,
      payload: room
    })
  }

  return (
    <RoomContext.Provider value={{ state, dispatch, dispatchRoom }}>
      {children}
    </RoomContext.Provider>
  )
}

export { RoomProvider, RoomContext, RoomActions }


//--------------------------------
// Hooks
//

export const useRoomContext = () => {
  const { state: { room } } = useContext(RoomContext)
  return {
    room,
    slug: room?.clientRoom?.slug ?? null,
    slugAgent: room?.clientAgent?.slug ?? null,
    slugSession: room?.clientSession?.slug ?? null,
    slugMetadata: room?.clientMetadata?.slug ?? null,
    branch: room?.clientRoom?.branch ?? null,
    localStore: room?.localStore ?? null,
    remoteStore: room?.remoteStore ?? null,
    sessionStore: room?.sessionStore ?? null,
    agentStore: room?.agentStore ?? null,
    metadataStore: room?.metadataStore ?? null,
    canvas2d: room?.canvas2d ?? null,
    canvas3d: room?.canvas3d ?? null,
    actions: room?.actions ?? null,
    clientRoom: room?.clientRoom ?? null,
    agentId: room?.clientAgent?.agentId ?? null,
    Player: room?.Player ?? null,
    Profile: room?.Profile ?? null,
    Wallet: room?.Wallet ?? null,
    Permission: room?.Permission ?? null,
    Settings: room?.Settings ?? null,
    Tileset: room?.Tileset ?? null,
    Portal: room?.Portal ?? null,
    Trigger: room?.Trigger ?? null,
    Screen: room?.Screen ?? null,
    Map: room?.Map ?? null,
    Editor: room?.Editor ?? null,
  }
}

