import React, { createContext, useReducer, useContext, useEffect } from 'react'

export const initialState = {
  editorPreview: true,
  editorLineNumbers: true,
  editorWordWrap: false,
  editorMiniMap: false,
}

const SettingsContext = createContext(initialState)

const SettingsActions = {
  SET_EDITOR_PREVIEW: 'SET_EDITOR_PREVIEW',
  SET_EDITOR_LINE_NUMBERS: 'SET_EDITOR_LINE_NUMBERS',
  SET_EDITOR_WORD_WRAP: 'SET_EDITOR_WORD_WRAP',
  SET_EDITOR_MINI_MAP: 'SET_EDITOR_MINI_MAP',
}

const SettingsProvider = ({
  children,
}) => {
  const [state, dispatch] = useReducer((state, action) => {
    let newState = { ...state }
    switch (action.type) {
      case SettingsActions.SET_EDITOR_PREVIEW:
        newState.editorPreview = action.payload
        break
      case SettingsActions.SET_EDITOR_LINE_NUMBERS:
        newState.editorLineNumbers = action.payload
        break
      case SettingsActions.SET_EDITOR_WORD_WRAP:
        newState.editorWordWrap = action.payload
        break
      case SettingsActions.SET_EDITOR_MINI_MAP:
        newState.editorMiniMap = action.payload
        break
      default:
        console.warn(`SettingsProvider: Unknown action [${action.type}]`)
        return state
    }
    return newState
  }, initialState)

  const dispatchSettings = (type, payload) => dispatch({ type, payload })

  return (
    <SettingsContext.Provider value={{ state, dispatch, dispatchSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export { SettingsProvider, SettingsContext, SettingsActions }


//--------------------------------
// Hooks
//

export const useSettingsContext = () => {
  const { state, dispatch, dispatchSettings } = useContext(SettingsContext)
  return {
    ...state,
    dispatch,
    dispatchSettings,
  }
}

