import { useEffect, useMemo, useRef } from 'react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useDocument, useLocalDocument } from '@/hooks/useDocument'
import { useRemoteDocumentIds } from '@/hooks/useDocumentIds'
import usePermission from '@/hooks/usePermission'
import useProfile from '@/hooks/useProfile'
import ModalScreenEdit from '@/components/ModalScreenEdit'
import { ScreenBook } from '@/components/ScreenBook'
import { TYPE } from '@/core/components/screen'
import { applyScrollProg } from '@/core/utils'
import Markdown from '@/components/Markdown'

const Screens = ({ }) => {
  const { localStore, actions } = useRoomContext()
  const screenIds = useRemoteDocumentIds('screen')
  const editingScreenId = useLocalDocument('screens', 'editing')
  const facingScreenId = useLocalDocument('screens', 'facing-3d')
  const { permission, isOwner, canEdit, canView } = usePermission(editingScreenId)
  const { view3d } = useProfile()

  const screensComponents = useMemo(() => {
    let result = []
    for (const screenId of screenIds) {
      const overlayScreen = (screenId == editingScreenId && !view3d)
      const selectedScreen = (screenId == editingScreenId || screenId == facingScreenId)
      result.push(
        <div key={screenId}
          className='FillParent Absolute'
          style={{
            zIndex: overlayScreen ? '100' : '-100',
          }}
        >
          <div id={screenId}
            className={`FillParent Clickable ${selectedScreen ? 'ScreenBackground' : 'ClearBackground'}`}
            onClick={() => localStore.setDocument('screens', 'editing', null)}
          >
            <ScreenComponent screenId={screenId} />
            {selectedScreen &&
              <div className='ScreenBorder' />
            }
          </div>
        </div>
      )
    }

    return result
  }, [screenIds.length, editingScreenId, facingScreenId, view3d, canEdit, canView])

  useEffect(() => {
    actions?.emitAction('syncScreens')
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
export const ScreenComponent = ({
  screenId,
}) => {
  const screen = useDocument('screen', screenId)

  if (screen?.type == TYPE.DOCUMENT) {
    return <DocumentScreen screenId={screenId} scrollProg={screen.page} content={screen.content || `# Screen [${screenId}] has no content`} />
  }

  if (screen?.type == TYPE.METADATA) {
    return <MetadataScreen screenId={screenId} scrollProg={screen.page} content={screen.content} />
  }

  if (screen?.type == TYPE.PDF_BOOK) {
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
const DocumentScreen = ({
  screenId,
  content,
  scrollProg,
}) => {
  const outerDiv = useRef()
  const innerDiv = useRef()

  useEffect(() => {
    applyScrollProg(outerDiv.current, innerDiv.current, scrollProg)
  }, [outerDiv.current, innerDiv.current, scrollProg])

  return (
    <div className='MarkdownScreen'>
      <div className='ScrollContainer' ref={outerDiv}>
        <Markdown className='ScrollContent' ref={innerDiv}>{content}</Markdown>
      </div>
    </div>
  )
}

//
// Json document
const MetadataScreen = ({
  screenId,
  content,
  scrollProg,
}) => {
  const outerDiv = useRef()
  const innerDiv = useRef()

  useEffect(() => {
    applyScrollProg(outerDiv.current, innerDiv.current, scrollProg)
  }, [outerDiv.current, innerDiv.current, scrollProg])

  const _content = `
\`\`\`json
${content ? content : '# Open Editor to load metadata'}
\`\`\`
`

  return (
    <div className='MarkdownScreen'>
      <div className='ScrollContainer' ref={outerDiv}>
        <Markdown className='ScrollContent' ref={innerDiv}>{_content}</Markdown>
      </div>
    </div>
  )
}
