import { useEffect, useState, useMemo, forwardRef } from 'react'
import { getLocalStore, getRemoteStore } from 'core/singleton'
import { emitAction } from 'core/controller'
import useDocument from 'hooks/use-document'
import useDocumentIds from 'hooks/use-document-ids'
import useLocalDocument from 'hooks/use-local-document'
import Markdown from 'components/markdown'


const Screens = ({}) => {
  const screenIds = useDocumentIds('screen')
  const is3d = useLocalDocument('show-3d', 'world') ?? false

  const screensComponents = useMemo(() => {
    let result = []
    const store = getRemoteStore()
    for (const screenId of screenIds) {
      const screen = store.getDocument('screen', screenId)
      if (!screen) {
        continue;
      }

      result.push(
        <div
          key={screenId}
          id={screenId}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: '0',
            left: '0',
          }}
        >
          <Markdown>{screen.content || `# Screen [${screenId}] has no content`}</Markdown>
        </div>
      )
    }

    return result
  }, [screenIds.length])

  useEffect(() => {
    emitAction('syncScreens')
  }, [screensComponents])

  const isDocOpen = false

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        visibility: (isDocOpen && !is3d) ? 'visible' : 'hidden',
      }}
    >
      {screensComponents}
    </div>
  )
}

export default Screens
