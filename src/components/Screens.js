import { useEffect, useState, useMemo, forwardRef } from 'react'
import { getLocalStore, getRemoteStore } from '@/core/singleton'
import { emitAction } from '@/core/controller'
import { useDocument, useLocalDocument } from '@/hooks/useDocument'
import useDocumentIds from '@/hooks/useDocumentIds'
import ModalScreenEdit from '@/components/ModalScreenEdit'
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
    return <PdfBookScreen screenId={screenId} url={screen.content} page={screen.page} />
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

//
// PDF Books
// https://github.com/wojtekmaj/react-pdf
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { clamp, map } from '@/core/utils'

// fix bug!...
// https://github.com/wojtekmaj/react-pdf/issues/680
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PdfBookScreen = ({
  screenId,
  url,
  page = 0,
}) => {
  const [numPages, setNumPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(null);

  function _onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    const store = getLocalStore()
    store.setDocument('page-count', screenId, numPages)
    console.log(`PDF ${screenId} has ${numPages} pages`)
  }

  useEffect(() => {
    const _page = Math.round(map(page, 0, 1, 1, numPages))
    console.log(`page progress:`, page, _page)
    setPageNumber(clamp(_page, 1, numPages))
  }, [page, numPages])

  return (
    <Document
      file={url}
      onLoadSuccess={_onDocumentLoadSuccess}
    >
      <Page
        pageNumber={pageNumber}
        width={document.getElementById('game').clientWidth}
      />
      <p>
        Page {pageNumber} of {numPages}
      </p>
    </Document>)
}

