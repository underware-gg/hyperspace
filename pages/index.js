import React from 'react'
import {
  VStack, HStack,
  Heading,
  Text,
  Box,
  Spacer,
  useDisclosure,
} from '@chakra-ui/react'
import Button from '@/components/Button'
import Layout from '@/components/Layout'
import ModalRoomCreate from '@/components/ModalRoomCreate'
import ModalRoomSelector from '@/components/ModalRoomSelector'

const HomePage = ({ slug }) => {
  const disclosureNewRoom = useDisclosure()
  const disclosureSelectRoom = useDisclosure()

  return (
    <Layout profile backgroundImage={'/gravity.jpg'}>
      <Box backgroundColor='black' borderRadius='lg' borderWidth='0px'>
        <VStack align='stretch' w='100%' spacing={8} shouldWrapChildren padding='50px' alignItems='center'>
          <Heading as='h1' size='4xl'>
            Hyperbox
          </Heading>
          <Text>
            A collaborative, composable metaverse
            <br />
            using CRDTs for state synchronisation
          </Text>

          <HStack>
            <Button
              size='sm'
              variant='outline'
              onClick={() => disclosureSelectRoom.onOpen()}
            >
              Select Room
            </Button>
            <Spacer />
            <Button
              size='sm'
              variant='outline'
              onClick={() => disclosureNewRoom.onOpen()}
            >
              Create Room
            </Button>
          </HStack>
        </VStack>
      </Box>

      <ModalRoomCreate
        disclosure={disclosureNewRoom}
      />

      <ModalRoomSelector
        disclosure={disclosureSelectRoom}
      />

    </Layout>
  )
}

export default HomePage
