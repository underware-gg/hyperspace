import React, { forwardRef } from 'react'
import { Button as ChakraButton } from '@chakra-ui/react'

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
  return (
    <ChakraButton
      colorScheme='teal'
      size={size}
      variant={variant}
      isLoading={loading}
      isDisabled={disabled}
      type={type}
      ref={ref}
      onClick={onClick}
    >
      {value ?? children}
    </ChakraButton>
  )
})

Button.displayName = 'Button'

export default Button
