import React from 'react'
import { Container, Box, Spacer } from '@chakra-ui/react'
import Header from 'components/header'
import Footer from 'components/footer'

const Layout = ({
  children,
  height='100%',
  backgroundImage,
}) => {
  return (
    <Box h={height} sx={{ display: 'flex', flexDirection: 'column' }} >
      <Header />
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
