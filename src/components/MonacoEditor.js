import React, { useRef, useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'

//
// Monaco Editor (too vanilla)
// https://github.com/microsoft/monaco-editor
// https://microsoft.github.io/monaco-editor/playground.html
//
// React/next.js working example:
// https://github.com/react-monaco-editor/react-monaco-editor/issues/271#issuecomment-986612363
//
// options:
// https://microsoft.github.io/monaco-editor/docs.html#interfaces/editor.IStandaloneEditorConstructionOptions.html
//

// available themes
// https://microsoft.github.io/monaco-editor/docs.html#interfaces/editor.IStandaloneEditorConstructionOptions.html#theme
const _themes = {
  light: 'vs',
  dark: 'vs-dark',
  // dark: 'hc-black',
}

const MonacoEditor = ({
  language = '',
  content,
  onChange = () => {},
  placeholder = 'Markdown shared document',
  className = null,
  colorMode = 'dark',
  disabled = false,
  readOnly = false,
  wordWrap = false,
  lineNumbers = true,
  miniMap = true,
}) => {
  const monacoEditorRef = useRef(null)
  const editorRef = useRef(null)

  // monaco takes years to mount, so this may fire repeatedly without refs set
  useEffect(() => {
    if (monacoEditorRef.current && editorRef.current) {
      // again, monaco takes years to mount and load, so this may load as null
      const model = monacoEditorRef.current.getModels()
      if (model?.length > 0) {
        // finally, do editor's document initialization here
        onInitializePane(monacoEditorRef, editorRef, model)
      }
    }
  }, [monacoEditorRef.current, editorRef.current])

  const onInitializePane = (
    monacoEditorRef,
    editorRef,
    model
  ) => {
    editorRef.current.setScrollTop(1)
    editorRef.current.setPosition({
      lineNumber: 2,
      column: 0,
    })
    editorRef.current.focus()
    monacoEditorRef.current.setModelMarkers(model[0], 'owner', null)
  }

  let options = {
    stopRenderingLineAfter: 1000,
    wordWrap,
    lineNumbers,
    minimap: { enabled: miniMap },
  }
  if (readOnly) {
    options = {
      ...options,
      readOnly: true,
      domReadOnly: true,
      scrollBeyondLastLine: false,
      tabIndex: -1,
    }
  }

  if (disabled) return <></>

  return <Editor
    value={content}
    language={language}
    onChange={(value, _event) => {
      onChange(value)
    }}
    className={className}
    onMount={(editor, monaco) => {
      monacoEditorRef.current = monaco.editor
      editorRef.current = editor
    }}
    options={options}
    theme={_themes[colorMode]} // preference
    // width='60em'    // preference
    height='41em' // preference
  />
}

export default MonacoEditor
