import React, { useEffect } from 'react'
import { Textarea as ChakraTextarea } from '@chakra-ui/react'
import ResizeTextarea from 'react-textarea-autosize'

const Textarea = ({
  value,
  onChange,
  // selectionStart,
  // selectionEnd,
}) => {
  // const ref = useRef(null)

  // useEffect(() => {
  //   const input = ref.current
  //   if (input) {
  //     input.setSelectionRange(selectionStart, selectionEnd)
  //   }
  // }, [ref, selectionStart, selectionEnd, value])

  const handleChange = (e) => {
    onChange?.(e)
  }

  return (
    <ChakraTextarea
      minH='unset'
      overflowY='auto'
      w='100%'
      resize={true}
      // ref={ref}
      minRows={8}
      maxRows={12}
      as={ResizeTextarea}
      placeholder='Start editing the document'
      value={value}
      onChange={handleChange}
    />
  )
}

Textarea.displayName = 'Textarea'

export default Textarea
