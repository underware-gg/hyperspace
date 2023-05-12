import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Box,
  Grid, GridItem,
  VStack, HStack,
  Spacer,
  useDisclosure,
} from '@chakra-ui/react'
import Layout from '@/components/Layout'
import Hyperbox from '@/components/Hyperbox'
import Button from '@/components/Button'
import ChatBox from '@/components/ChatBox'
import TilesetSelector from '@/components/TilesetSelector'
import ModalHelp from '@/components/ModalHelp'
import ModalSnapshots from '@/components/ModalSnapshots'
import InteractMenu from '@/components/InteractMenu'
import ExportImportMenu from '@/components/ExportImportMenu'
import { useSlugs } from '@/hooks/useSlugs'
import { useRoomContext } from '@/hooks/RoomContext'
import usePermission from '@/hooks/usePermission'
import { ModalSettings, useSettingsDisclosure } from '@/components/ModalSettings'
import { validateRoomSlug } from '@/core/utils'
import { makeRoute } from '@/core/routes'

const RoomPage = () => {
  const router = useRouter()
  const { slug, key, isLocal, forceRevert } = useSlugs()
  const slugIsValid = validateRoomSlug(slug) && (!key || validateRoomSlug(key))

  useEffect(() => {
    if (router.isReady && !slugIsValid) {
      router.replace('/limbo')
    }
  }, [router.isReady, slugIsValid])

  const { agentId, room, actions } = useRoomContext()
  const { canEdit } = usePermission('world')

  const [showHelp, setShowHelp] = useState(false)

  const settingsDisclosure = useSettingsDisclosure('world')
  const snapshotDisclosure = useDisclosure()

  useEffect(() => {
    if (!room?.clientRoom) return
    const _travel = (slug) => {
      console.log(`Travel to...`, slug)
      router.push(makeRoute({slug}))
    }
    room.clientRoom.on('travel', _travel)
    return () => {
      room.clientRoom?.off('travel', _travel)
    }
  }, [room])

  if (!router.isReady || !slugIsValid) {
    return null
  }

  return (
    <Layout profile>

      <Grid templateColumns='repeat(5, 1fr)' gap={2}>

        {/* <GridItem>
        </GridItem> */}

        <GridItem colSpan={5}>
          <VStack align='stretch' className='Stretch'>
            <HStack>
              <Button size='sm' onClick={() => actions?.emitAction('toggle3d')}>
                2D/3D
              </Button>
              <Button size='sm' onClick={() => setShowHelp(!showHelp)}>
                Help
              </Button>
              <Button size='sm' onClick={() => snapshotDisclosure.onOpen()}>
                Snapshots
              </Button>

              <Spacer />
              <ExportImportMenu />

              <Spacer />
              <InteractMenu />
            </HStack>

            <HStack>
              <TilesetSelector />
              <Spacer />
              <Button size='sm' onClick={() => actions?.emitAction('toggleGravityMap')}>
                Edit Map
              </Button>
              <Button disabled={!canEdit} size='sm' onClick={() => settingsDisclosure.openSettings()}>
                Room Settings
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
            <Hyperbox slug={slug} serverKey={key} isLocal={isLocal} forceRevert={forceRevert} />
          </Box>
        </GridItem>


        {process.env.DEV &&
          <GridItem colSpan={5}>
            {agentId}
          </GridItem>
        }

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
