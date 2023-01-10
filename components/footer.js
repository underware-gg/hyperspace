import React from 'react'
import { Box } from '@chakra-ui/react'

const Footer = () => {
  return (
    <Box
      as='footer'
      p='0.5em'
      pb='0.75em'
      display='flex'
      align='center'
      justifyContent='center'
      borderWidth='1px 0 0 0'
      >
      A collaborative, composable metaverse using CRDTs for state synchronisation.
    </Box>
  )
}

export default Footer
