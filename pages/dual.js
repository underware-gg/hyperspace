import { useEffect, useState } from 'react'
import {
  VStack, HStack, Spacer,
} from '@chakra-ui/react'
import { RoomProvider } from '@/hooks/RoomContext'
import { AvatarButton } from '@/components/Avatar'
import Layout from '@/components/Layout'
import Hyperbox from '@/components/Hyperbox'
import SlugSelector from '@/components/SlugSelector'

const DualPage = () => {
  return (
    <Layout height='100vh'>
      <HStack>
        <div style={{ height: '380px' }}>
          <AvatarButton />
        </div>
        <Room />
        <Room />
      </HStack>
    </Layout>
  )
}

export default DualPage

const Room = () => {
  const [slug, setSlug] = useState(null)

  const style = {
    width: '450px',
  }

  return (
    <RoomProvider>
      <VStack style={style} alignItems='center'>
        <SlugSelector selectedValue={slug} onChange={setSlug} />
        <div className='Relative'>
          <Hyperbox slug={slug} render3d={false} renderScreens={true} />
        </div>
      </VStack>
    </RoomProvider>
  )
}
