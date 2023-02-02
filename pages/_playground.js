import { VStack, Heading, Text, Box, Button } from '@chakra-ui/react'
import Layout from '@/components/Layout'

const Favicon = ({ slug }) => {

  return (
    <Layout height='100vh' backgroundImage={'/gravity.jpg'}>
      <Box backgroundColor='black' borderRadius='lg' borderWidth='0px'>
        <VStack align='stretch' w='100%' spacing={8} shouldWrapChildren padding='50px' alignItems='center'>
          <Heading as='h1' size='4xl'>
            Hyperbox
          </Heading>
          <Text>
            GPT isn't here
          </Text>
          <Button
            size='sm'
            variant='outline'
            // colorScheme={'teal'}
            onClick={() => {}}
          >
            Do Something
          </Button>
        </VStack>
      </Box>


    </Layout>
  )
}


export default Favicon
