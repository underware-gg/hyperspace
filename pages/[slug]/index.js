import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Box,
  Grid, GridItem,
  VStack, HStack,
  Spacer,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { useLocalDocument } from '@/hooks/useDocument'
import { focusGameCanvas } from '@/core/game-canvas'
import { emitAction } from '@/core/controller'
import Layout from '@/components/Layout'
import Button from '@/components/Button'
import ChatBox from '@/components/ChatBox'
import TilesetSelector from '@/components/TilesetSelector'
import ModalHelp from '@/components/ModalHelp'
import ModalSnapshots from '@/components/ModalSnapshots'
import InteractMenu from '@/components/InteractMenu'
import Screens from '@/components/Screens'
import RoomDownloadMenu from '@/components/RoomDownloadMenu'
import VeridaMenu from '@/components/VeridaMenu'
import { useRoom } from '@/hooks/useRoom'
import usePermission from '@/hooks/usePermission'
import { AvatarButton } from '@/components/Avatar'
import { ModalSettings, useSettingsDisclosure } from '@/components/ModalSettings'

const RoomPage = () => {
  const { agentId } = useRoom();
  const [showHelp, setShowHelp] = useState(false)
  const is3d = useLocalDocument('show-3d', 'world') ?? false
  const router = useRouter()
  const canvasRef = useRef()
  const canvas3dRef = useRef()
  const { slug } = router.query

  const { canEdit } = usePermission('world')
  const settingsDisclosure = useSettingsDisclosure('world')

  const snapshotDisclosure = useDisclosure()

  useEffect(() => {
    focusGameCanvas()
  }, [is3d, canvasRef, canvas3dRef])

  useEffect(() => {
    if (slug && canvasRef.current && canvas3dRef.current && !agentId) {
      import('src/core/game').then(({ default: Game }) => {
        const game = new Game()
        game.init(slug, canvasRef.current, canvas3dRef.current)
      })
    }
  }, [slug, canvasRef.current, canvas3dRef.current, agentId])

  return (
    <Layout height='100vh'>

      <Grid templateColumns='repeat(5, 1fr)' gap={2}>

        <GridItem>
          <AvatarButton />
        </GridItem>

        <GridItem colSpan={4}>
          <VStack align='stretch' className='Stretch'>
            <HStack>
              <Button size='sm' onClick={() => emitAction('toggle3d')}>
                2D/3D
              </Button>
              <Button size='sm' onClick={() => setShowHelp(!showHelp)}>
                Help
              </Button>
              <Spacer />
              <InteractMenu />
            </HStack>

            <HStack>
              <TilesetSelector />
              <Spacer />
              <Button disabled={!canEdit} size='sm' onClick={() => settingsDisclosure.openSettings()}>
                Room Settings
              </Button>
              <Button size='sm' onClick={() => snapshotDisclosure.onOpen()}>
                Snapshots
              </Button>
            </HStack>
          </VStack>
        </GridItem>


        <GridItem>
          <Box
            className='Relative'
            border='1px'
            borderRadius='2px'
          >
            <ChatBox />
          </Box>
        </GridItem>

        <GridItem colSpan={4}>
          <Box
            className='Relative'
            border='1px'
            borderRadius='2px'
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

            <Screens />
          </Box>
        </GridItem>



        <GridItem>
          {process.env.ENV == 'desenv' && <p>Agent ID: {agentId}</p>}
        </GridItem>

        <GridItem colSpan={4}>
          <HStack>
            <RoomDownloadMenu />
            <Spacer />
            <VeridaMenu />
          </HStack>
        </GridItem>

      </Grid>

      <ModalHelp
        isOpen={showHelp}
        handleClose={() => setShowHelp(false)}
      />

      <ModalSettings type='Room' settingsDisclosure={settingsDisclosure} />

      <ModalSnapshots disclosure={snapshotDisclosure} />

    </Layout>
  )
}

export default RoomPage
