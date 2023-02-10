import { useEffect, useMemo } from 'react'
import { getRemoteStore } from '@/core/singleton'
import { emitAction } from '@/core/controller'
import { useDocument, useLocalDocument } from '@/hooks/useDocument'
import useDocumentIds from '@/hooks/useDocumentIds'
import ModalScreenEdit from '@/components/ModalScreenEdit'
import { ScreenBook } from '@/components/ScreenBook'
import * as Screen from '@/core/components/screen'

const Screens = ({ }) => {
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
            zIndex: (isEditing && !is3d) ? '100' : '-100',
          }}
        >
          <div id={screenId} className='FillParent ScreenBackground'>
            <ScreenComponent screenId={screenId} />
            <div className='ScreenBorder' />
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
      <ModalScreenEdit screenId={editingScreenId} />
    </div>
  )
}

export default Screens

//-------------------------
// Generic Screen component
//
const ScreenComponent = ({
  screenId,
}) => {
  const screen = useDocument('screen', screenId)

  if (screen?.type == Screen.TYPE.DOCUMENT) {
    return <DocumentScreen screenId={screenId} content={screen.content || `# Screen [${screenId}] has no content`} />
  }

  if (screen?.type == Screen.TYPE.PDF_BOOK) {
    return <ScreenBook screenId={screenId} url={screen.content} page={screen.page} />
  }

  return (
    <div className='FillParent ScreenError'>
      Invalid screen type [{screen?.type}]
    </div>
  )
}

//------------------------------
// Specialized Screen components
//

//
// Markdown document
import Markdown from '@/components/Markdown'
const DocumentScreen = ({
  screenId,
  content,
}) => {
  return (
    <Markdown>{content}</Markdown>
  )
}
