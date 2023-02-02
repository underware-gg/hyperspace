import React, { useEffect, forwardRef } from 'react'
import { Textarea as ChakraTextarea } from '@chakra-ui/react'
import ResizeTextarea from 'react-textarea-autosize'

const Textarea = forwardRef(({
  value,
  onChange,
}, ref) => {

  const handleChange = (e) => {
    onChange?.(e)
  }

  return (
    <ChakraTextarea
      ref={ref}
      minH='unset'
      overflowY='auto'
      w='100%'
      resize={true}
      minRows={8}
      maxRows={12}
      as={ResizeTextarea}
      placeholder='Start editing the document'
      value={value}
      onChange={handleChange}
    />
  )
})

Textarea.displayName = 'Textarea'

export default Textarea
