import React, { forwardRef } from 'react'
import { Button as ChakraButton } from '@chakra-ui/react'
import useGameCanvas from '@/hooks/useGameCanvas'

const Button = forwardRef(({
  value,
  type = 'button',
  size = 'sm',
  colorScheme = 'teal',
  loading,
  fullWidth,
  disabled,
  toggleState = null,
  variant = null,
  className = null,
  style = {},
  onClick = () => { },
  children,
}, ref) => {
  const { gameCanvas } = useGameCanvas()

  const _onClick = () => {
    onClick()
    gameCanvas?.focus()
  }

  return (
    <ChakraButton
      ref={ref}
      colorScheme={colorScheme}
      size={size}
      variant={toggleState === false ? 'outline' : toggleState === true ? null : variant}
      isLoading={loading}
      isDisabled={disabled}
      type={type}
      className={className}
      style={style}
      onClick={() => _onClick()}
    >
      {value ?? children}
    </ChakraButton>
  )
})

Button.displayName = 'Button'

export {
  Button,
}
