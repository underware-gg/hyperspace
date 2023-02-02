import { useEffect, useState, useMemo, forwardRef } from 'react'
import { getLocalStore, getRemoteStore } from '@/core/singleton'
import { emitAction } from '@/core/controller'
import useDocument from '@/hooks/useDocument'
import useDocumentIds from '@/hooks/useDocumentIds'
import useLocalDocument from '@/hooks/useLocalDocument'
import Markdown from '@/components/Markdown'
import ScreenEditModal from '@/components/ScreenEditModal'
import * as Screen from '@/core/components/screen'


const ScreenComponent = ({
  screenId,
}) => {
  const screen = useDocument('screen', screenId)

  if(screen?.type == Screen.TYPE.DOCUMENT) {
    return <Markdown>{screen.content || `# Screen [${screenId}] has no content`}</Markdown>
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        border: 'solid 4px white',
        backgroundColor: '#f0f8',
        // backgroundImage: 'url(/nosignal_testcard.jpg)',
        // backgroundSize: 'cover',
        // backgroundPosition: 'center center',
        // imageRendering: 'pixelated',
      }}
    >
      Invalid scren type [{screen?.type}]
    </div>
  )
}


const Screens = ({}) => {
  const screenIds = useDocumentIds('screen')
  const is3d = useLocalDocument('show-3d', 'world') ?? false
  const editingScreenId = useLocalDocument('screens', 'editing')

  const screensComponents = useMemo(() => {
    let result = []
    const store = getRemoteStore()
    for (const screenId of screenIds) {
      const isEditing = (screenId == editingScreenId)
      result.push(
        <div key={screenId}
          className='FillParent Absolute'
          style={{
            visibility: (isEditing && !is3d) ? 'visible' : 'hidden',
          }}
        >
          <div id={screenId} className='FillParent'>
            <ScreenComponent screenId={screenId} />
          </div>
        </div>
      )
    }

    return result
  }, [screenIds.length, editingScreenId])

  useEffect(() => {
    emitAction('syncScreens')
  }, [screensComponents])

  return (
    <div className='FillParent'>
      {screensComponents}
      <ScreenEditModal screenId={editingScreenId} />
    </div>
  )
}

export default Screens
