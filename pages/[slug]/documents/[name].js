import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { VStack, Heading, Box, Text } from '@chakra-ui/react'
import Layout from '@/components/Layout'
import Markdown from '@/components/Markdown'
import Textarea from '@/components/Textarea'
import useRoom from '@/hooks/useRoom'
import useDocument from '@/hooks/useDocument'
import useDocumentIds from '@/hooks/useDocumentIds'
import { getRemoteStore } from '@/core/singleton'
import * as Screen from '@/core/components/screen'

const DocumentPage = () => {
  const router = useRouter()
  const { slug, name } = router.query

  const screenIds = useDocumentIds('screen')
  const [screenId, setScreenId] = useState(null)
  const screen = useDocument('screen', screenId)

  useEffect(() => {
    if (slug) {
      console.log(`Import slug`, slug)
      import('@/core/networking').then((ClientRoom) => {
        console.log(`Imported!!!`)
        ClientRoom.init(slug)
        const room = ClientRoom.get()
        room.init(slug)
      })
    }
  }, [slug])


  useEffect(() => {
    if (!screenIds) return
    const remoteStore = getRemoteStore();
    for (const id of screenIds) {
      const screen = remoteStore.getDocument('screen', id);
      if (name == id || name == screen?.name) {
        setScreenId(id)
        return
      }
    }

  }, [name, screenIds])

  const _handleInputChange = (e) => {
    if(screenId) {
      const content = e.target.value
      Screen.editScreen(screenId, {
        content,
      })
    }
  }

  return (
    <Layout>
      <VStack align='stretch' w='100%' spacing={4} shouldWrapChildren>
        <Heading as='h1' size='2xl'>
          Screen <Text color='orange.300' as='span'>{screen?.name ?? '???'}</Text>
        </Heading>
        <Box border='1px' borderRadius='4px'>
          <Textarea
            value={screen?.content ?? null}
            onChange={(e) => _handleInputChange(e)}
          />
          <Box p='4'>
            <Markdown>{screen?.content ?? ''}</Markdown>
          </Box>
        </Box>
      </VStack>
    </Layout>
  )
}

export default DocumentPage
