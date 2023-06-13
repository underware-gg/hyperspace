import React from 'react'
import dynamic from 'next/dynamic'
import '@uiw/react-textarea-code-editor/dist.css'

const _CodeEditor = dynamic(
  () => import('@uiw/react-textarea-code-editor').then((mod) => mod.default),
  { ssr: false }
)

const CodeEditor = React.forwardRef(({
  content,
  minRows = 15,
  maxRows = 25,
  onChange,
  colorMode = 'dark',
  language = '',
  placeholder = 'Markdown shared document',
  disabled = false,
}, ref) => {
  if (disabled) return <></>

  return (
    <div className='FillParent'>
      <_CodeEditor
        ref={ref}
        value={content}
        language={language}
        placeholder={placeholder}
        data-color-mode={colorMode}
        onChange={(e) => onChange(e.target.value)}
        padding={15}
        style={{
          fontSize: 14,
          // backgroundColor: '#f5f5f5',
          fontFamily:
            'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace'
        }}
      />
    </div>
  )
})

export default CodeEditor
