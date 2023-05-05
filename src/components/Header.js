import React from 'react'
import Link from 'next/link'
import { Container, Box, HStack, Spacer, Heading, Image } from '@chakra-ui/react'
import ProfileManager from '@/components/ProfileManager'

const Header = ({
  profile = false,
  width = 'container.lg',
}) => {
  return (
    <Box
      borderWidth='0 0 1px 0'
      sx={{ display: 'flex', width: '100%' }}
    >
      <Container maxW={width}>

        <HStack
          spacing={3}
          pt={2}
          pb={2}
          pl={4}
          pr={4}
          w='100%'
          alignItems='end'
        >
          <Box w='280px'>
            <Link href='/'>
              <Heading as='h1' size='xl'>
                Hyperbox
              </Heading>
            </Link>
          </Box>
          <Spacer sx={{ flex: 1 }} />

          {profile &&
            <ProfileManager />
          }

          <Spacer sx={{ flex: 1 }} />
          
          <Box w='280px'>
            <a href='https://twitter.com/funDAOmental'>
              <Image
                src='/funDAOmental-stamp.png'
                alt='funDAOmental'
                w='280px'
                h='30px'
              />
            </a>
          </Box>
        </HStack>
      </Container>
    </Box>
  )
}

export default Header
