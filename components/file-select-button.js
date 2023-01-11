import React, { useRef } from 'react'
import { HStack, Text } from '@chakra-ui/react'
import Button from 'components/button'

const FileSelectButton = ({
  id,
  disabled=false,
  label='Select File',
  textBefore,
  textAfter,
  onSelect,
  accept,
}) => {
  const inputRef = useRef();

  function onChange(e) {
    const files = e.target.files
    if (files?.length > 0) {
      onSelect(files[0]);
    }
  }

  return (
    <HStack>
      {textBefore && <Text>{textBefore}</Text>}
      <input type='file'
        id={id}
        accept={accept}
        onChange={(e) => onChange(e)}
        ref={inputRef}
        hidden
      />
      <Button variant='outline' onClick={() => inputRef.current.click()}>{label}</Button>
      {textAfter && <Text>{textAfter}</Text>}
    </HStack>
  )
}

export default FileSelectButton
