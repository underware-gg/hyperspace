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
    localStore: room?.localStore ?? null,
    remoteStore: room?.remoteStore ?? null,
    sessionStore: room?.sessionStore ?? null,
    agentStore: room?.agentStore ?? null,
    canvas2d: room?.canvas2d ?? null,
    canvas3d: room?.canvas3d ?? null,
    actions: room?.actions ?? null,
    agentId: room?.clientRoom?.agentId ?? null,
    clientRoom: room?.clientRoom ?? null,
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

