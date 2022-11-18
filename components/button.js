import React, { forwardRef } from 'react'
import { Button as ChakraButton } from '@chakra-ui/react'

const Button = forwardRef(({
  value,
  type = 'button',
  loading,
  fullWidth,
  disabled,
  variant,
  onClick,
}, ref) => {
  return (
    <ChakraButton
      colorScheme="teal"
      variant={variant}
      isLoading={loading}
      isDisabled={disabled}
      type={type}
      ref={ref}
      onClick={onClick}
    >
      {value}
    </ChakraButton>
  )
})

Button.displayName = 'Button'

export default Button
