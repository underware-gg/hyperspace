import { useState } from 'react'
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
import ModalRoom from '@/components/ModalRoom'
import ModalRoomSelector from '@/components/ModalRoomSelector'

const HomePage = ({ slug }) => {
  const disclosure = useDisclosure()
  const disclosureSelector = useDisclosure()
  const router = useRouter();

  function enterRoom(roomName) {
    disclosure.onClose();
    const url = roomName?.length > 0 ? `/${roomName}` : slug;
    // router.push(url);

    // dirty fix!
    window.history.pushState({}, '', url);
    window.history.go(0);
  }

  return (
    <Layout height='100vh' backgroundImage={'/gravity.jpg'} full>
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

      <ModalRoom
        disclosure={disclosure}
        onSubmit={(roomName) => enterRoom(roomName)}
      />

      <ModalRoomSelector
        disclosure={disclosureSelector}
        onSubmit={(roomName) => enterRoom(roomName)}
      />

    </Layout>
  )
}

export const getServerSideProps = async (context) => {
  return {
    props: {
      slug: `/${nanoid()}`,
    },
  }
}

export default HomePage
