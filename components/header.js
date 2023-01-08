import React from 'react'
import { Box, HStack, Spacer, Image } from '@chakra-ui/react'
import Link from 'next/link'

const Header = () => {
  return (
    <HStack
      spacing={4}
      pt={2}
      pb={2}
      pl={4}
      pr={4}
      borderWidth='0 0 1px 0'
      sx={{ display: 'flex', width: '100%' }}
      backgroundColor={'#000'}
      >
      <Box>
        <Link href='/'>
          <a>
            <Image
              src='/funDAOmental-stamp.png'
              alt='funDAOmental'
              w='280px'
              h='30px'
            />
          </a>
        </Link>
      </Box>
      <Spacer sx={{ flex: 1 }} />
    </HStack>
  )
}

export default Header
