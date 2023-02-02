import React from 'react'
import { Container, Box, Spacer } from '@chakra-ui/react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const Layout = ({
  children,
  height='100%',
  backgroundImage,
  full=false,
}) => {
  return (
    <Box h={height} sx={{ display: 'flex', flexDirection: 'column' }} >
      <Header full={full} />
      <Box
        height={'100%'}
        backgroundImage={backgroundImage}
        // backgroundColor={'#f00'}
      >
        <Container
          as='main'
          maxW='container.lg'
          centerContent
          pt='1.5em'
          pb='1.5em'
          flexGrow='1'
          margin='auto'
        // backgroundColor={'#f00'}
        >
          {children}
        </Container>
      </Box>
      <Footer />
    </Box>
  )
}

export default Layout
