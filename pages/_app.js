import { theme } from '@/styles/theme'
import { ChakraProvider } from '@chakra-ui/react'
import { RoomProvider } from '@/hooks/RoomContext'
import '/styles/styles.scss'

const MyApp = ({ Component, pageProps }) => (
  <ChakraProvider theme={theme}>
    <RoomProvider>
      <Component {...pageProps} />
    </RoomProvider>
  </ChakraProvider>
)

export default MyApp
