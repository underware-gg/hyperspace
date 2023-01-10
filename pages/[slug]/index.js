import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { VStack, HStack, Heading, Box, Text, Spacer } from '@chakra-ui/react'
import Layout from 'components/layout'
import Button from 'components/button'
import DocumentModal from 'components/document-modal'
import useDocument from 'hooks/use-document'
import useLocalDocument from 'hooks/use-local-document'
import { getLocalStore, getRemoteStore } from 'core/singleton'
import { fromSourceToDataURL } from 'core/textures'
import * as Tileset from 'core/components/tileset'
import * as ClientRoom from 'core/networking'

const handleTilesetChange = async (e) => {
  const files = e.target.files
  if (files && files[0]) {
    try {
      const { dataUrl, width, height } = await fromSourceToDataURL(URL.createObjectURL(files[0]))

      if (width === 320 && height === 32) {
        Tileset.create('world', { blob: dataUrl, size: { width, height } })
      } else {
        Tileset.remove('world')
      }
    } catch (e) {
      Tileset.remove('world')
    }
  }
}

const downloadRoomData = (slug) => {
  const room = ClientRoom.get()
  if (room === null) {
    return
  }

  const snapshotOps = room.getSnapshotOps()

  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(snapshotOps))}`
  const dlAnchor = document.getElementById('download-room-data')
  dlAnchor.setAttribute('href', dataStr)
  dlAnchor.setAttribute('download', `room-${slug}.json`)
  dlAnchor.click()
}

const Room = () => {
  const document = useDocument('document', 'world')
  const tileset = useDocument('tileset', 'world')
  const is3d = useLocalDocument('show-3d', 'world') ?? false
  const isDocOpen = useLocalDocument('show-doc', 'world') ?? false
  const initialRef = useRef()
  const router = useRouter()
  const canvasRef = useRef()
  const canvas3dRef = useRef()
  const { slug } = router.query

  useEffect(() => {
    if (is3d) {
      if (canvasRef.current) {
        canvas3dRef.current.focus()
      }
    } else {
      if (canvas3dRef.current) {
        canvasRef.current.focus()
      }
    }
  }, [is3d, canvasRef, canvas3dRef])

  const handleInputChange = e => {
    const store = getRemoteStore()
    store.setDocument('document', 'world', { content: e.target.value })
  }

  const handleClose = () => {
    const store = getLocalStore()
    store.setDocument('show-doc', 'world', false)
  }

  const handleUploadRoomData = async (e) => {
    const files = e.target.files

    if (files?.[0] === undefined) {
      return
    }

    const file = files[0]

	  const reader = new FileReader()
	  reader.onload = (e2) => {
      const str = e2.target.result
	    const json = JSON.parse(str)

      const remoteStore = getRemoteStore()

      for (const op of json) {
        if (op.pathIndex === 0) {
          const { type, key, value } = op
          remoteStore.setDocument(type, key, value)
        }
      }
    }

	  reader.readAsText(file)
  }

  useEffect(() => {
    if (canvasRef.current && canvas3dRef.current && slug) {
      import ('core/game').then(({ default: Game }) => {
        const game = new Game()
        game.init(slug, canvasRef.current, canvas3dRef.current)
      })
    }
  }, [slug, canvasRef, canvas3dRef])

  return (
    <Layout>
      <VStack align='stretch' w='100%' spacing={4} shouldWrapChildren>
        <HStack>
          <img src={tileset?.blob ?? 'tileset.png'} alt="tileset-preview" />
          <Spacer />
          <div>Upload Tileset</div>
          <input type="file" id="tileset-image" name="img" accept="image/*" onChange={handleTilesetChange}/>
        </HStack>
        <Box
          border="1px"
          borderRadius="4px"
        >
          <canvas
            id="game"
            ref={canvasRef}
            border="1px"
            borderradius={4}
            width={640}
            height={480}
            style={{
              width: '100%',
              height: '100%',
              borderTop: '1px solid white',
              borderBottom: '1px solid white',
              display: is3d ? 'none' : 'block',
            }}
            tabIndex="1"
          >
            Canvas not supported by your browser.
          </canvas>
          <canvas
            id="game3D"
            ref={canvas3dRef}
            border="1px"
            borderradius={4}
            width={640}
            height={480}
            style={{
              width: '100%',
              height: '100%',
              display: is3d ? 'block' : 'none',
            }}
            tabIndex="2"
          >
            Canvas not supported by your browser.
          </canvas>
        </Box>

        <HStack>
          <Button variant='outline' colorScheme='teal' size='md' onClick={() => { downloadRoomData(slug) }}>
            Download room data
          </Button>
          <Spacer />
          <label htmlFor="upload-room-data">Upload room data</label>
          <input type="file" id="upload-room-data" accept=".json" onChange={handleUploadRoomData} />
          <a id="download-room-data" href="#" style={{ display: 'none' }}></a>
        </HStack>
      </VStack>

      <DocumentModal
        initialRef={initialRef}
        finalRef={is3d ? canvas3dRef : canvasRef}
        text={document?.content || ''}
        isOpen={isDocOpen}
        onClose={handleClose}
        onInputChange={handleInputChange}
      />

    </Layout>
  )
}

export default Room
