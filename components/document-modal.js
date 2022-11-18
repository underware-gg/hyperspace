import React, { useRef } from 'react'
import {
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import Textarea from 'components/textarea'
import Button from 'components/button'

const DocumentModal = ({
  finalRef,
  initialRef,
  isOpen,
  text,
  onClose,
  onInputChange,
}) => {
  const containerRef = useRef(null)

  return (
    <Modal
      initialFocusRef={initialRef}
      finalFocusRef={finalRef}
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent ref={containerRef}>
        <ModalHeader>
          Document editor
        </ModalHeader>
        <ModalCloseButton />
          <ModalBody pb={4}>
            <VStack spacing={4}>
              <Textarea
                value={text}
                onChange={onInputChange}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fullWidth
              value="Close"
              onClick={onClose}
            />
          </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DocumentModal
