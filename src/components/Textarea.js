import React, { useEffect, forwardRef } from 'react'
import { Textarea as ChakraTextarea } from '@chakra-ui/react'
import ResizeTextarea from 'react-textarea-autosize'

const Textarea = forwardRef(({
  content,
  minRows = 15,
  maxRows = 25,
  onChange,
  disabled,
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
      minRows={minRows}
      maxRows={maxRows}
      as={ResizeTextarea}
      disabled={disabled || content == null}
      placeholder={content == null ? 'No content' : 'Start editing the document'}
      value={content}
      onChange={handleChange}
    />
  )
})

Textarea.displayName = 'Textarea'

export default Textarea
