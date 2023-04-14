import { useState } from 'react'
import Link from 'next/link'
import { ConnectKitButton } from 'connectkit'
import {
  VStack,
} from '@chakra-ui/react'
import Layout from '@/components/Layout'

const PagesPage = ({ slug }) => {
  return (
    <Layout height='100vh'>
      <VStack align='stretch' w='100%' alignItems='center'>
        <ConnectKitButton />
      </VStack>
    </Layout>
  )
}

export default PagesPage
