import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import {
  Box,
  Grid, GridItem,
  VStack, HStack,
  Spacer,
  useDisclosure,
} from '@chakra-ui/react'
import { useSlugs } from '@/hooks/useSlugs'
import { useRoomContext } from '@/hooks/RoomContext'
import usePermission from '@/hooks/usePermission'
import { Button } from '@/components/Button'
import Layout from '@/components/Layout'
import Screens from '@/components/Screens'
import Hyperbox from '@/components/Hyperbox'
import ChatBox from '@/components/ChatBox'
import TilesetSelector from '@/components/TilesetSelector'
import ModalHelp from '@/components/ModalHelp'
import ModalSnapshots from '@/components/ModalSnapshots'
import InteractMenu from '@/components/InteractMenu'
import ExportImportMenu from '@/components/ExportImportMenu'
import { ModalSettings, useSettingsDisclosure } from '@/components/ModalSettings'
import { crawlerSlugToRoom } from '@/core/utils/crawler'
import { makeRoute } from '@/core/utils/routes'

const SlugPage = () => {
  const router = useRouter()
  const {
    slug,
    branch,
    isLocal,
    slugIsValid,
    isCrawlerSlug,
    isQuest,
    forceRevert,
  } = useSlugs()

  useEffect(() => {
    if (router.isReady && !slugIsValid) {
      router.replace(makeRoute({ slug: '/limbo' }))
    }
  }, [router.isReady, slugIsValid])

  const sourceData = useMemo(() => {
    return isCrawlerSlug ? crawlerSlugToRoom(slug, { isQuest }) : null
  }, [slug, isCrawlerSlug])
  const resetAgent = (sourceData != null)
  const metadataSlug = isQuest ? ':endlessquest' : null

  const { agentId, room, actions } = useRoomContext()
  const { canEdit } = usePermission('world')

  const [showHelp, setShowHelp] = useState(false)

  const settingsDisclosure = useSettingsDisclosure('world')
  const snapshotDisclosure = useDisclosure()

  useEffect(() => {
    if (!room?.clientRoom) return
    const _travel = (slug) => {
      console.log(`Travel to...`, slug)
      router.push(makeRoute({ slug }))
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

      <Screens />

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
            <Hyperbox
              slug={slug}
              branch={branch}
              isLocal={isLocal}
              forceRevert={forceRevert}
              sourceData={sourceData}
              metadataSlug={metadataSlug}
              resetAgent={resetAgent}
            />
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

export default SlugPage
