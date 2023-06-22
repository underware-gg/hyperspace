import React from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Spacer,
} from '@chakra-ui/react'
import { Button } from '@/components/Button'

const _defaultOptions = {
  header: 'Action required',
  message: 'Confirm?',
  confirmLabel: 'OK',
  cancelLabel: 'Cancel',
  onConfirm: () => { },
  onCancel: () => { }
}

export const useConfirmDisclosure = (options = _defaultOptions) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return {
    openConfirmDialog: onOpen,
    isOpen, onClose,
    ..._defaultOptions,
    ...options,
  }
}

export const DialogConfirm = ({
  confirmDisclosure = _defaultOptions,
}) => {
  const { isOpen, onClose, onConfirm, onCancel, header, message, confirmLabel, cancelLabel } = confirmDisclosure

  const _cancel = () => {
    onCancel()
    onClose()
  }

  const _confirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size='sm'
    >
      <AlertDialogOverlay>
        <AlertDialogContent
          backgroundColor='#000a'
        >
          {header &&
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              {header}
            </AlertDialogHeader>
          }

          <AlertDialogBody>
            {message}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button onClick={() => _cancel()}>
              {cancelLabel ?? 'Cancel'}
            </Button>
            <Spacer />
            <Button colorScheme='red' onClick={() => _confirm()} ml={3}>
              {confirmLabel ?? 'OK'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
