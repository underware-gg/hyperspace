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
    body: 'Share Tech Mono, monospace',
    heading: 'Share Tech Mono, monospace',
  },

  colors: {
    black: '#000',
    white: '#fff',
    gray: '#ddd',
    // chakra: { border: { color: 'teal' }},
  },

  styles: {
    global: {
      body: {
        bg: 'black',
        color: 'white',
      },
    },
  },

  // replace chakra vars
  // ring: {
  //   color: 'teal',
  // },

  // custom chakra styles
  // ex: <ModalContent boxShadow='bigShadow'>
  shadows: {
    hyperOutline: '0 0 0 1px teal',
    hyperShadow: '0 0 0 0.5px teal, 10px 10px 10px black, -10px -10px 10px black'
  },

}

export const theme = deepMerge(_theme, _custom);
