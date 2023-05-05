import Link from 'next/link'
import {
  VStack,
} from '@chakra-ui/react'
import Layout from '@/components/Layout'

const PagesPage = () => {
  return (
    <Layout>
      <VStack align='stretch' w='100%' alignItems='center'>
        <Link href='/pages/dual'>▫️ Dual Room Demo ▫️</Link>
        <Link href='/pages/stateToken'>▫️ Hyperbox State Token ▫️</Link>
      </VStack>
    </Layout>
  )
}

export default PagesPage
