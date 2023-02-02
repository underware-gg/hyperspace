import { ChakraProvider } from '@chakra-ui/react'
import { theme } from '@/styles/theme'
import '/styles/styles.css'

const MyApp = ({ Component, pageProps }) => (
  <ChakraProvider theme={theme}>
    <Component {...pageProps} />
  </ChakraProvider>
)

export default MyApp
