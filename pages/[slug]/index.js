import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { Container, Box, VStack, HStack, Text, Spacer } from '@chakra-ui/react'
import Layout from 'components/layout'
import Button from 'components/button'
import TilesetSelector from 'components/tileset-selector'
import CharacterSelector from 'components/character-selector'
import FileSelectButton from 'components/file-select-button'
import DocumentModal from 'components/document-modal'
import Markdown from 'components/markdown'
import useRoom from 'hooks/use-room'
import useDocument from 'hooks/use-document'
import useLocalDocument from 'hooks/use-local-document'
import usePlayer from 'hooks/use-player'
import { getLocalStore, getRemoteStore } from 'core/singleton'
import { fromSourceToDataURL } from 'core/textures'
import { emitAction } from 'core/controller'
import * as Profile from 'core/components/profile'
import * as Tileset from 'core/components/tileset'
import * as ClientRoom from 'core/networking'

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
  const { agentId } = useRoom();
  const { overPortal, overBook, overDocument, canPlace, playerConnected, playerProfile } = usePlayer(agentId)
  const document = useDocument('document', 'world')
  const profile = useDocument('profile', agentId)
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

  const _handleUploadRoomData = async (fileObject) => {
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

    reader.readAsText(fileObject)
  }

  const _handleUploadTileset = async (fileObject) => {
    try {
      const { dataUrl, width, height } = await fromSourceToDataURL(URL.createObjectURL(fileObject))
      if (width === 320 && height === 32) {
        Tileset.create('world', {
          blob: dataUrl,
          name: fileObject.name,
          size: { width, height },
        })
      } else {
        Tileset.remove('world')
      }
    } catch (e) {
      Tileset.remove('world')
    }
  }

  const _handleSelectSpritesheet = (fileName => {
    if (agentId && fileName) {
      Profile.update(agentId, {
        spritesheet: fileName,
      })
    }
  })

  const _handleSelectTileset = (fileName => {
    Tileset.create('world', {
      blob: null,
      name: fileName,
      size: { width: 320, height: 32 },
    })
  })

  useEffect(() => {
    if (canvasRef.current && canvas3dRef.current && slug) {
      import('core/game').then(({ default: Game }) => {
        const game = new Game()
        game.init(slug, canvasRef.current, canvas3dRef.current)
      })
    }
  }, [slug, canvasRef, canvas3dRef])

  return (
    <Layout>
      <Container maxW='full'>

        <VStack align='stretch' spacing={4} shouldWrapChildren >
          <HStack>
            <CharacterSelector
              profile={profile}
              onSelect={(fileName) => _handleSelectSpritesheet(fileName)}
            />
            <Button size='sm' onClick={() => emitAction('toggle3d')}>
              2D/3D
            </Button>
            <Spacer />
            <Button size='sm' disabled={!overPortal} onClick={() => emitAction('interact')}>
              Enter Portal
            </Button>
            <Button size='sm' disabled={!overBook} onClick={() => emitAction('interact')}>
              Read Book
            </Button>
            <Button size='sm' disabled={!overDocument} onClick={() => emitAction('interact')}>
              Edit Document
            </Button>
          </HStack>

          <HStack>
            <TilesetSelector
              customTileset={tileset}
              onSelect={(fileName) => _handleSelectTileset(fileName)}
            />
            <FileSelectButton
              label='Upload Tileset'
              id='tileset-image'
              accept='image/*'
              onSelect={(fileObject) => _handleUploadTileset(fileObject)}
            />
            <Spacer />
            <Button size='sm' disabled={!canPlace} onClick={() => emitAction('createPortal')}>
              Create Portal
            </Button>
            { playerConnected == true ?
              <Text>{
                playerProfile.avatarUri ?
                <img src={ playerProfile.avatarUri } width="40" height="40" /> :
                <Text>No</Text>
              }{ playerProfile.name }</Text> :
              <Button size='sm' disabled={!canPlace} onClick={() => emitAction('connect')}>
                Connect
              </Button>
            }
          </HStack>

          <Box
            style={{ position: 'relative' }}
            border='1px'
            borderRadius='4px'
          >
            <canvas
              id='game'
              ref={canvasRef}
              border='1px'
              borderradius={4}
              width={process.env.CANVAS_WIDTH}
              height={process.env.CANVAS_HEIGHT}
              style={{
                width: '100%',
                height: '100%',
                borderTop: '1px solid white',
                borderBottom: '1px solid white',
                display: is3d ? 'none' : 'block',
              }}
              tabIndex='1'
            >
              Canvas not supported by your browser.
            </canvas>
            <canvas
              id='game3D'
              ref={canvas3dRef}
              border='1px'
              borderradius={4}
              width={process.env.CANVAS_WIDTH}
              height={process.env.CANVAS_HEIGHT}
              style={{
                width: '100%',
                height: '100%',
                display: is3d ? 'block' : 'none',
              }}
              tabIndex='2'
            >
              Canvas not supported by your browser.
            </canvas>

            {(isDocOpen && !is3d) &&
              <div style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: '0',
                left: '0',
              }}>
                <Markdown>{document?.content || ''}</Markdown>
              </div>
            }
          </Box>

          <HStack>
            <Button variant='outline' size='sm' onClick={() => downloadRoomData(slug)}>
              Download Room Data
            </Button>
            <Button variant='outline' size='sm' onClick={() => emitAction('inviteFriend')}>
              Invite Friend
            </Button>
            <a id='download-room-data' href='#' hidden></a>
            <Spacer />
            <FileSelectButton
              label='Upload Room Data'
              id='upload-room-data'
              accept='.json'
              onSelect={(fileObject) => _handleUploadRoomData(fileObject)}
            />
          </HStack>

          {process.env.ENV == 'desenv' && <div>Agent ID: {agentId}</div>}
        </VStack>

        <DocumentModal
          initialRef={initialRef}
          finalRef={is3d ? canvas3dRef : canvasRef}
          text={document?.content || ''}
          isOpen={isDocOpen}
          onClose={handleClose}
          onInputChange={handleInputChange}
        />

      </Container>
    </Layout>
  )
}

export default Room
