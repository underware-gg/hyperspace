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

  const noContent = (value == null);

  return (
    <ChakraTextarea
      ref={ref}
      minH='unset'
      overflowY='auto'
      w='100%'
      resize={true}
      minRows={15}
      maxRows={25}
      as={ResizeTextarea}
      disabled={noContent}
      placeholder={noContent ? 'No content' : 'Start editing the document'}
      value={value}
      onChange={handleChange}
    />
  )
})

Textarea.displayName = 'Textarea'

export default Textarea
