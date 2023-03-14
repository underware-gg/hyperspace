import React, { forwardRef } from 'react'
import { Button as ChakraButton } from '@chakra-ui/react'
import useGameCanvas from '@/hooks/useGameCanvas'

const Button = forwardRef(({
  value,
  type = 'button',
  size = 'sm',
  loading,
  fullWidth,
  disabled,
  variant,
  onClick,
  children,
}, ref) => {
  const { gameCanvas, is3d } = useGameCanvas()

  const _onClick = () => {
    onClick()
    gameCanvas?.focus()
  }
  
  return (
    <ChakraButton
      ref={ref}
      colorScheme='teal'
      size={size}
      variant={variant}
      isLoading={loading}
      isDisabled={disabled}
      type={type}
      onClick={() => _onClick()}
    >
      {value ?? children}
    </ChakraButton>
  )
})

Button.displayName = 'Button'

export default Button
