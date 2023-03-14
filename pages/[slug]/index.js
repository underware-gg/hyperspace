import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Box,
  Grid, GridItem,
  VStack, HStack,
  Spacer,
  useDisclosure,
} from '@chakra-ui/react'
import { emitAction } from '@/core/controller'
import Layout from '@/components/Layout'
import Game from '@/components/Game'
import Button from '@/components/Button'
import ChatBox from '@/components/ChatBox'
import TilesetSelector from '@/components/TilesetSelector'
import ModalHelp from '@/components/ModalHelp'
import ModalSnapshots from '@/components/ModalSnapshots'
import InteractMenu from '@/components/InteractMenu'
import RoomDownloadMenu from '@/components/RoomDownloadMenu'
import VeridaMenu from '@/components/VeridaMenu'
import { useRoomContext } from '@/hooks/RoomContext'
import usePermission from '@/hooks/usePermission'
import { AvatarButton } from '@/components/Avatar'
import { ModalSettings, useSettingsDisclosure } from '@/components/ModalSettings'

const RoomPage = () => {
  const router = useRouter()
  const { slug } = router.query

  const { agentId, room } = useRoomContext()
  const { canEdit } = usePermission('world')

  const [showHelp, setShowHelp] = useState(false)
  
  const settingsDisclosure = useSettingsDisclosure('world')
  const snapshotDisclosure = useDisclosure()

  useEffect(() => {
    if(!room) return
    const _travel = (slug) => {
      console.log(`Travel to...`, slug)
      router.push(`/${slug}`)
    }
    room.clientRoom.on('travel', _travel)
    return () => {
      room.clientRoom.off('travel', _travel)
    }
  }, [room])

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
            h='700'
          >
            <ChatBox />
          </Box>
        </GridItem>

        <GridItem colSpan={4}>
          <Box
            className='Relative'
            border='1px'
            borderRadius='2px'
            maxH='700'
          // h='700'
          >
            <Game slug={slug} />
          </Box>
        </GridItem>



        <GridItem>
          {process.env.ENV == 'desenv' && agentId}
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
