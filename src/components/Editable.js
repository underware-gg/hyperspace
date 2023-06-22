import React, { useEffect, useState } from 'react'
import {
  Editable as ChakraEditable,
  EditablePreview,
  EditableInput,
  useEditableControls,
  useStatStyles,
} from '@chakra-ui/react'
import {
  HStack,
  ButtonGroup,
  IconButton,
  Flex,
  Input,
} from '@chakra-ui/react'
import {
  CheckIcon,
  CloseIcon,
  EditIcon,
} from '@chakra-ui/icons'

function EditableControls() {
  const {
    isEditing,
    getSubmitButtonProps,
    getCancelButtonProps,
    getEditButtonProps,
  } = useEditableControls()

  return isEditing ? (
    <ButtonGroup justifyContent='center' size='sm'>
      <IconButton icon={<CheckIcon />} {...getSubmitButtonProps()} />
      <IconButton icon={<CloseIcon />} {...getCancelButtonProps()} />
    </ButtonGroup>
  ) : (
    <Flex justifyContent='center'>
      <IconButton size='sm' icon={<EditIcon />} {...getEditButtonProps()} />
    </Flex>
  )
}

const Editable = ({
  currentValue,
  onSubmit,
  disabled=false,
}) => {
  const [value, setValue] = useState(currentValue)

  useEffect(() => {
    // value changed externally (not editing)
    setValue(currentValue)
  }, [currentValue])

  const _onChange = (value) => {
    // value was edited
    setValue(value)
  }

  return (
    <ChakraEditable
      textAlign='center'
      defaultValue={currentValue}
      value={value}
      isPreviewFocusable={false}
      onChange={_onChange}
      onSubmit={onSubmit}
    >
      <HStack>
        <EditablePreview color='important' />
        <Input as={EditableInput} />
        {!disabled &&
          <EditableControls />
        }
      </HStack>
    </ChakraEditable>
  )
}

export default Editable
