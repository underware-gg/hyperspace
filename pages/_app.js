import { theme } from '@/styles/theme'
import { ChakraProvider } from '@chakra-ui/react'
import { RoomProvider } from '@/hooks/RoomContext'
import { VeridaProvider } from '@/hooks/VeridaContext'
import '/styles/styles.scss'

const MyApp = ({ Component, pageProps }) => (
  <ChakraProvider theme={theme}>
    <VeridaProvider>
      <RoomProvider>
        <Component {...pageProps} />
      </RoomProvider>
    </VeridaProvider>
  </ChakraProvider>
)

export default MyApp
