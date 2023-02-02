import { useState, useRef } from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Spacer,
} from '@chakra-ui/react'
import Button from '@/components/Button'

const DialogConfirm = ({
  finalRef,
  text,
  onClose,
  onConfirm,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  // const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef()

  const trigger = () => {
    setIsOpen(!isOpen)
    if (isOpen) {
      // onClose()
    }
  }

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize='lg' fontWeight='bold'>
            Delete Customer
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure? You can't undo this action afterwards.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button onClick={() => trigger()}>
              Cancel
            </Button>
            <Spacer />
            <Button colorScheme='red' onClick={onClose} ml={3}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}

export default DialogConfirm
