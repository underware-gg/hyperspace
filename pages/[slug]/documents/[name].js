import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { VStack, Heading, Box, Text } from '@chakra-ui/react'
import { useRoom } from '@/hooks/useRoom'
import { useScreen } from '@/hooks/useScreen'
import Layout from '@/components/Layout'
import { ScreenComponent } from '@/components/Screens'
import ScreenEditor from '@/components/ScreenEditor'


const DocumentPage = () => {
  const router = useRouter()
  const { slug, name } = router.query

  // useRoom() will dispatch to RoomContext when the room is loaded
  useRoom(slug, null, false)

  const { screenId, screen } = useScreen(name)

  return (
    <Layout>
      <VStack align='stretch' w='100%' spacing={4} shouldWrapChildren>
        <Heading as='h1' size='2xl'>
          Screen <Text color='important' as='span'>{screen?.name ?? '...'}</Text>
        </Heading>
        <Box border='1px' borderRadius='4px'>
          {screenId && <>
            <ScreenEditor screenId={screenId} options={{
              minRows: 10, maxRows: 10
            }} />
            <Box maxH='600'>
              <ScreenComponent screenId={screenId} />
            </Box>
          </>
          }
        </Box>
      </VStack>
    </Layout>
  )
}

export default DocumentPage
