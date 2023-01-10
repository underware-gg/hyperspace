import React from 'react'
import { Container, Box, Spacer } from '@chakra-ui/react'
import Header from 'components/header'
import Footer from 'components/footer'

const Layout = ({ children, backgroundImage }) => {
  return (
    <Box h="100vh" sx={{ display: 'flex', flexDirection: 'column' }} >
      <Header />
      <Box
        height={"100vh"}
        backgroundImage={backgroundImage}
        // backgroundColor={'#f00'}
      >
        <Container
          as='main'
          maxW='container.lg'
          centerContent
          pt='1.5em'
          pb='1.5em'
          flexGrow="1"
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
