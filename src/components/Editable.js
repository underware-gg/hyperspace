import {
  Editable as ChakraEditable,
  EditablePreview,
  EditableInput,
  useEditableControls,
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
}) => {

  return (
    <ChakraEditable
      textAlign='center'
      defaultValue={currentValue}
      // fontSize='2xl'
      isPreviewFocusable={false}
      onSubmit={onSubmit}
    >
      <HStack>
        <EditablePreview  color='important' />
        <Input as={EditableInput} />
        <EditableControls />
      </HStack>
    </ChakraEditable>
  )
}

export default Editable
