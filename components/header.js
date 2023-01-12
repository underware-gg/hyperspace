import React from 'react'
import Link from 'next/link'
import { Container, Box, HStack, Spacer, Heading, Image } from '@chakra-ui/react'

const Header = ({
  full = false,
}) => {
  return (
    <Box
      borderWidth='0 0 1px 0'
      sx={{ display: 'flex', width: '100%' }}
    >
      <Container maxW={full ? 'full' : 'container.lg'}>

        <HStack
          spacing={3}
          pt={2}
          pb={2}
          pl={4}
          pr={4}
          w='100%'
        >
          <Box>
            <Link href='/'>
              <a>
                <Heading as='h1' size='xl'>
                  Hyperbox
                </Heading>
              </a>
            </Link>
          </Box>
          <Spacer sx={{ flex: 1 }} />
          <Box>
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
