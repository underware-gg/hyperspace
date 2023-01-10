import { extendTheme } from '@chakra-ui/react'
import { deepMerge } from '../core/utils'

// chakra-io theming
// https://chakra-ui.com/docs/styled-system/customize-theme

const _theme = extendTheme({
  initialColorMode: 'dark',
  useSystemColorMode: false,
});
// console.log(_theme)

const _custom = {
  fonts: {
    body: 'monospace',
    heading: 'monospace',
  },

  colors: {
    black: '#000',
    white: '#fff',
    gray: '#ddd',
  },

  styles: {
    global: {
      body: {
        bg: 'black',
        color: 'white',
      },
    },
  },

}

export const theme = deepMerge(_theme, _custom);
