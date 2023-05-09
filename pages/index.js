import React from 'react'
import { useRouter } from 'next/router'
import { nanoid } from 'nanoid'
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
import { makeRoute } from '@/core/routes'

const HomePage = ({ slug }) => {
  const disclosure = useDisclosure()
  const disclosureSelector = useDisclosure()
  const router = useRouter()

  function enterRoom(roomName) {
    disclosure.onClose();
    const slug = roomName?.length > 0 ? roomName : nanoid();
    router.push(makeRoute({ slug }))
  }

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
              onClick={() => disclosureSelector.onOpen()}
            >
              Select Room
            </Button>
            <Spacer />
            <Button
              size='sm'
              variant='outline'
              onClick={() => disclosure.onOpen()}
            >
              Create Room
            </Button>
          </HStack>
        </VStack>
      </Box>

      <ModalRoomCreate
        disclosure={disclosure}
      />

      <ModalRoomSelector
        disclosure={disclosureSelector}
        onSubmit={(roomName) => enterRoom(roomName)}
      />

    </Layout>
  )
}

export default HomePage
