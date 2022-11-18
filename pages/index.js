import { useState } from 'react'
import Head from 'next/head'
import NextLink from 'next/link'
import { LinkIcon } from '@chakra-ui/icons'
import { VStack, Heading, Text, Link } from '@chakra-ui/react'
import { nanoid } from 'nanoid'
import Layout from '../components/layout'

const Home = ({ slug }) => (
  <Layout>
    <VStack align='stretch' w='100%' spacing={4} shouldWrapChildren>
      <Heading as='h1' size='2xl'>
        Metaverse in a box
      </Heading>
      <Text>
        A metaverse project using CRDTs for state synchronisation.
      </Text>
      <NextLink href={slug} passHref>
        <Link>
          Create room <LinkIcon mx='2px' />
        </Link>
      </NextLink>
    </VStack>
  </Layout>
)

export const getServerSideProps = async (context) => {
  return {
    props: {
      slug: `/${nanoid()}`,
    },
  }
}

export default Home
