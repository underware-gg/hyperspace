import { useState } from 'react'
import { useRouter } from 'next/router'
import { nanoid } from 'nanoid'
import { VStack, Heading, Text, Box } from '@chakra-ui/react'
import Button from '@/components/Button'
import Layout from '@/components/Layout'
import ModalRoom from '@/components/ModalRoom'

const HomePage = ({ slug }) => {
  const router = useRouter();
  const [roomModal, setRoomModal] = useState(false);

  function enterRoom(roomName) {
    setRoomModal(false);
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
          <Button
            size='sm'
            variant='outline'
            onClick={() => setRoomModal(true)}
          >
            Create / Enter Room
          </Button>
        </VStack>
      </Box>

      <ModalRoom
        isOpen={roomModal}
        onClose={() => setRoomModal(false)}
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
