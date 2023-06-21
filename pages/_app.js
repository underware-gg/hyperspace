import { theme } from '@/styles/theme'
import { WagmiConfig, createClient } from 'wagmi'
import { mainnet, goerli } from 'wagmi/chains'
import { ConnectKitProvider, getDefaultClient } from 'connectkit'
import { ChakraProvider } from '@chakra-ui/react'
import { SettingsProvider } from '@/hooks/SettingsContext'
import { RoomProvider } from '@/hooks/RoomContext'
import { VeridaProvider } from '@/hooks/VeridaContext'
import Head from '@/components/Head'
import '/styles/styles.scss'

const client = createClient(
  getDefaultClient({
    appName: 'Hyperbox',
    chains: [goerli],
    autoConnect: false,
    // alchemyId: process.env.ALCHEMY_ID,
  }),
)

const connectKitTheme = {
  '--ck-font-family': 'Share Tech Mono',
}

const MyApp = ({ Component, pageProps }) => (
  <WagmiConfig client={client}>
    <ConnectKitProvider theme='midnight' customTheme={connectKitTheme}>
      <ChakraProvider theme={theme}>
        <VeridaProvider>
          <SettingsProvider>
            <RoomProvider>
              <Head />
              <Component {...pageProps} />
            </RoomProvider>
          </SettingsProvider>
        </VeridaProvider>
      </ChakraProvider>
    </ConnectKitProvider>
  </WagmiConfig>
)

export default MyApp
