import React, { useRef } from 'react'
import { HStack, Text } from '@chakra-ui/react'
import { Button } from '@/components/Button'

const FileSelectButton = ({
  id,
  disabled = false,
  label = 'Select File',
  variant = null,
  textBefore,
  textAfter,
  onSelect = (fileObject) => { },
  accept,
}) => {
  const inputRef = useRef(null)

  function onChange(e) {
    const files = e.target.files
    if (files?.length > 0) {
      onSelect(files[0])
    }
  }

  return (
    <HStack>
      {textBefore && <Text>{textBefore}</Text>}
      <Button variant={variant} disabled={disabled} onClick={() => inputRef.current?.click()}>
        {label}
      </Button>
      <input type='file'
        id={id}
        accept={accept}
        onChange={(e) => onChange(e)}
        ref={inputRef}
        hidden
      />
      {textAfter && <Text>{textAfter}</Text>}
    </HStack>
  )
}

export default FileSelectButton
