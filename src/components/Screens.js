import { useEffect, useState, useMemo, useRef } from 'react'
import { getLocalStore, getRemoteStore } from '@/core/singleton'
import { emitAction } from '@/core/controller'
import { useDocument, useLocalDocument } from '@/hooks/useDocument'
import { getGameCanvasElement } from '@/core/game-canvas'
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
            zIndex: (isEditing && !is3d) ? '100' : '-100',
          }}
        >
          <div id={screenId} className='FillParent'>
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
    return <PdfBookScreen screenId={screenId} url={screen.content} page={screen.page} />
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
  const [pageSizes, setPageSizes] = useState([]);

  async function _onDocumentLoadSuccess(pdf) {
    // console.log(pdf)
    let sizes = {}
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const viewport = page.getViewport({ scale: 1 });
      sizes[p] = {
        width: viewport.width,
        height: viewport.height,
        aspect: viewport.width / viewport.height,
      }
    }

    setNumPages(pdf.numPages);
    setPageSizes(sizes)

    const store = getLocalStore()
    store.setDocument('page-count', screenId, pdf.numPages)
    console.log(`PDF ${screenId} has ${pdf.numPages} pages`)
  }

  const pageNumber = useMemo(() => {
    const _page = Math.round(map(page, 0, 1, 1, numPages))
    return clamp(_page, 1, numPages)
  }, [page, numPages])

  const containerStyle = useMemo(() => {
    let scale = 1
    let topMargin = 0
    let sideMargin = 0

    const page = pageSizes[pageNumber]
    if (page) {
      const gameCanvas = getGameCanvasElement()
      const gameWidth = gameCanvas.clientWidth
      const gameHeight = gameCanvas.clientHeight
      const gameAspect = gameWidth / gameHeight

      if (gameAspect > page.aspect) {
        scale = gameHeight / page.height
        sideMargin = Math.floor((gameWidth - page.width * scale) / 2)
      } else {
        scale = gameWidth / page.width
        topMargin = Math.floor((gameHeight - page.height * scale) / 2)
      }
      // console.log(gameWidth, gameHeight, gameAspect, page.width, page.height, page.aspect, '>', topMargin, sideMargin, scale)
    }

    return {
      width: '100%',
      height: '100%',
      transformOrigin: 'top left',
      transform: `translate(${sideMargin}px,${topMargin}px)scale(${scale})`,
    }
  }, [numPages, pageSizes, pageNumber])

  return (
    <div style={containerStyle}>

      <Document
        file={url}
        onLoadSuccess={_onDocumentLoadSuccess}
        className='FillParent'
      >
        <Page
          pageNumber={pageNumber}
          className='FillParent PdfBook'
          canvasBackground='white'
        />
        {/* <p>Page {pageNumber} of {numPages}</p> */}
      </Document>
    </div>
  )
}

