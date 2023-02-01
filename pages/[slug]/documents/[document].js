import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { VStack, Heading, Box, Text } from '@chakra-ui/react'
import Layout from 'components/layout'
import Markdown from 'components/markdown'
import Textarea from 'components/textarea'
import useDocument from 'hooks/use-document'
import { getRemoteStore } from 'core/singleton'

const DocumentPage = () => {
  const document = useDocument('document', 'world')
  const router = useRouter()
  const { slug } = router.query

  useEffect(() => {
    if (slug) {
      import ('core/networking').then((ClientRoom) => {
        ClientRoom.init(slug)
        const room = ClientRoom.get()
        room.init(slug)
      })
    }
  }, [slug])

  const handleInputChange = e => {
    const store = getRemoteStore()
    store.setDocument('document', 'world', { content: e.target.value })
  }

  return (
    <Layout>
      <VStack align='stretch' w='100%' spacing={4} shouldWrapChildren>
        <Heading as='h1' size='2xl'>
          Document editor
        </Heading>
        <Text>
          Documents edited here show up in the metaverse.
        </Text>
        <Box border="1px" borderRadius="4px">
          <Textarea
            value={document?.content || ''}
            onChange={handleInputChange}
          />
          <Box p="4">
            <Markdown>{document?.content || ''}</Markdown>
          </Box>
        </Box>
      </VStack>
    </Layout>
  )
}

export default DocumentPage
