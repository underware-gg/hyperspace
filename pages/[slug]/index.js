import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { Container, Box, VStack, HStack, Text, Spacer } from '@chakra-ui/react'
import Layout from '@/components/Layout'
import Button from '@/components/Button'
import TilesetSelector from '@/components/TilesetSelector'
import CharacterSelector from '@/components/CharacterSelector'
import HelpModal from '@/components/HelpModal'
import InteractMenu from '@/components/InteractMenu'
import Screens from '@/components/Screens'
import RoomDownloadMenu from '@/components/RoomDownloadMenu'
import VeridaLogin from '@/components/VeridaLogin'
import VeridaMenu from '@/components/VeridaMenu'
import useRoom from '@/hooks/useRoom'
import useLocalDocument from '@/hooks/useLocalDocument'
import { focusGameCanvas } from '@/core/game-canvas'
import { emitAction } from '@/core/controller'

const RoomPage = () => {
  const { agentId } = useRoom();
  const [showHelp, setShowHelp] = useState(false)
  const is3d = useLocalDocument('show-3d', 'world') ?? false
  const router = useRouter()
  const canvasRef = useRef()
  const canvas3dRef = useRef()
  const { slug } = router.query

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
    <Layout>
      <Container maxW='full'>

        <VStack align='stretch' spacing={4} shouldWrapChildren >
          <HStack>
            <CharacterSelector />
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
            <VeridaLogin />
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

            <Screens />
          </Box>

          <HStack>
            <RoomDownloadMenu />
            <Spacer />
            <VeridaMenu />
          </HStack>

          {process.env.ENV == 'desenv' && <div>Agent ID: {agentId}</div>}
        </VStack>

        <HelpModal
          isOpen={showHelp}
          handleClose={() => setShowHelp(false)}
        />

      </Container>
    </Layout>
  )
}

export default RoomPage
