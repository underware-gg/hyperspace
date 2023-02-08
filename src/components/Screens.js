import { useEffect, useState, useMemo, useRef } from 'react'
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
        backgroundColor: '#F39C1288',
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
  const [containerStyle, setContainerStyle] = useState({});
  const canvasRef = useRef();

  function _onDocumentLoadSuccess(pdf) {
    setNumPages(pdf.numPages);
    const store = getLocalStore()
    store.setDocument('page-count', screenId, pdf.numPages)
    console.log(`PDF ${screenId} has ${pdf.numPages} pages`)
  }

  const pageNumber = useMemo(() => {
    const _page = Math.round(map(page, 0, 1, 1, numPages))
    return clamp(_page, 1, numPages)
  }, [page, numPages])

  useEffect(() => {
    if (canvasRef.current){
      const gameWidth = document.getElementById('game').clientWidth
      const gameHeight = document.getElementById('game').clientHeight
      const gameAspect = gameWidth / gameHeight

      const pdfWidth = canvasRef.current.clientWidth
      const pdfHeight = canvasRef.current.clientHeight
      const pdfAspect = pdfWidth / pdfHeight

      let scale = 1
      let topMargin = 0
      let sideMargin = 0
      if (gameAspect > pdfAspect) {
        scale = gameHeight / pdfHeight
        sideMargin = ((gameWidth - pdfWidth * scale) / 2) / gameWidth
      } else {
        scale = gameWidth / pdfWidth
        topMargin = ((gameHeight - pdfHeight * scale) / 2) / gameHeight
      }
      console.log(gameWidth, gameHeight, gameAspect, pdfWidth, pdfHeight, pdfAspect, '>', topMargin, sideMargin, scale)

      // setPageScale(scale)
      setContainerStyle({
        transformOrigin: 'top left',
        transform: `scale(${scale})`,
        margin: `${Math.floor(topMargin * 100)}% ${Math.floor(sideMargin * 100)}%`
      })
    }
  }, [canvasRef.current, url, numPages])

  return (
    <div style={containerStyle}>

      <Document
        file={url}
        onLoadSuccess={_onDocumentLoadSuccess}
      >
        <Page
          pageNumber={pageNumber}
          canvasRef={canvasRef}
          className='PdfBook'
          canvasBackground='white'
          // width={document.getElementById('game').clientWidth}
          // height={document.getElementById('game').clientHeight}
          // scale={1}
        />
        <p>
          Page {pageNumber} of {numPages}
        </p>
      </Document>
    </div>
  )
}

