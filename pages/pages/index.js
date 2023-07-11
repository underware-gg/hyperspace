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
        <div>
          ▫️ <Link href='/api/geturl/https%3A%2F%2Fhyperspace.stage.fundaomental.com%2Fgravity.jpg'>/api/geturl/ ▫️</Link>
          {' '}
          (<a href='https://hyperspace.stage.fundaomental.com/gravity.jpg'>gravity.jpg</a>)
        </div>
      </VStack>
    </Layout>
  )
}

export default PagesPage
