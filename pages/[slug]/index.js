import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { Container, Box, VStack, HStack, Text, Spacer } from '@chakra-ui/react'
import Layout from 'components/layout'
import Button from 'components/button'
import TilesetSelector from 'components/tileset-selector'
import CharacterSelector from 'components/character-selector'
import FileSelectButton from 'components/file-select-button'
import DocumentModal from 'components/document-modal'
import InteractMenu from 'components/interact-menu'
import Markdown from 'components/markdown'
import useRoom from 'hooks/use-room'
import useDocument from 'hooks/use-document'
import useLocalDocument from 'hooks/use-local-document'
import useVerida from 'hooks/use-verida'
import { getLocalStore, getRemoteStore } from 'core/singleton'
import { fromSourceToDataURL } from 'core/textures'
import { emitAction } from 'core/controller'
import * as Profile from 'core/components/profile'
import * as Tileset from 'core/components/tileset'
import * as ClientRoom from 'core/networking'

const downloadRoomData = async (slug) => {
  const room = ClientRoom.get()
  if (room === null) {
    return
  }

  const snapshotOps = room.getSnapshotOps()
  const VeridaUser = (await import('core/networking/verida')).VeridaUser
  await VeridaUser.saveRoom(slug, snapshotOps)

  /*
  console.log(snapshotOps)

  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(snapshotOps))}`
  const dlAnchor = document.getElementById('download-room-data')
  dlAnchor.setAttribute('href', dataStr)
  dlAnchor.setAttribute('download', `room-${slug}.json`)
  dlAnchor.click()*/
}

const Room = () => {
  const { agentId } = useRoom();
  const { playerConnected, playerProfile } = useVerida(agentId)
  const document = useDocument('document', 'world')
  const profile = useDocument('profile', agentId)
  const tileset = useDocument('tileset', 'world')
  const is3d = useLocalDocument('show-3d', 'world') ?? false
  const isDocOpen = useLocalDocument('show-doc', 'world') ?? false
  const initialRef = useRef()
  const router = useRouter()
  const canvasRef = useRef()
  const canvas3dRef = useRef()
  const documentRef = useRef()
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

  const restoreRoomData = async () => {
    const room = ClientRoom.get()
    if (room === null) {
      return
    }

    const VeridaUser = (await import('core/networking/verida')).VeridaUser
    const snapshot = await VeridaUser.getRoom(room.slug)

    if (snapshot) {
      const json = JSON.parse(snapshot)
      console.log(json)
      const remoteStore = getRemoteStore()

      for (const op of json) {
        if (op.pathIndex === 0) {
          console.log(type, key, value)
          const { type, key, value } = op
          remoteStore.setDocument(type, key, value)
        }
      }
    } else {
      console.log('No room data found')
    }
  }

  const lastTweet = async () => {
    const VeridaUser = (await import('core/networking/verida')).VeridaUser
    await VeridaUser.setDocumentToLastTweet()
  }

  /*
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
  */

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
    if (slug && canvasRef.current && canvas3dRef.current && documentRef.current) {
      import('core/game').then(({ default: Game }) => {
        const game = new Game()
        game.init(slug, canvasRef.current, canvas3dRef.current, documentRef.current)
      })
    }
  }, [slug, canvasRef.current, canvas3dRef.current, documentRef.current])

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
            <InteractMenu />
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
            { playerConnected == true ?
              <Text onClick={() => emitAction('disconnect')}>{
                playerProfile.avatarUri ?
                <img src={ playerProfile.avatarUri } width="40" height="40" /> :
                <Text>No</Text>
              }{ playerProfile.name }</Text> :
              <Button size='sm' onClick={() => emitAction('connect')}>
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

            <div id='document'
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: '0',
                left: '0',
                visibility: (isDocOpen && !is3d) ? 'visible' : 'hidden',
              }}
            >
              <div ref={documentRef}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              >
                <Markdown>{document?.content || ''}</Markdown>
              </div>
            </div>
          </Box>

          <HStack>
            <Button variant='outline' size='sm' onClick={async () => await downloadRoomData(slug)}>
              Save Room Data
            </Button>
            <Button variant='outline' size='sm' onClick={() => emitAction('inviteFriend')}>
              Invite Friend
            </Button>
            <Spacer />
            <Button variant='outline' size='sm' onClick={async () => await restoreRoomData(slug)}>
              Restore Room Data
            </Button>
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
