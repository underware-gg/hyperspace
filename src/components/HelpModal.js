import React from 'react'
import {
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
} from '@chakra-ui/react'
import Button from '@/components/Button'

const HelpModal = ({
  isOpen,
  handleClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
      size='xl'
    >
      <ModalOverlay />
      <ModalContent
        backgroundColor='#000a'
      >
        <ModalHeader>
          Keyboard shortcuts
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <VStack spacing={1}>
            <Text>◀️🔼🔽▶️ : move (2D) / walk+turn (3D)</Text>
            <Text><b>WASD</b> : move (2D) /  walk+straffe (3D)</Text>
            <Text><b>IJKL</b> : look around (3D)</Text>
            <Text><b>SPACE</b> : jump</Text>
            <Text><b>T</b> : switches 2D/3D view</Text>
            <Text><b>0-9</b> : paint tiles on the map</Text>
            <Text><b>P</b> : creates a portal</Text >
            <Text><b>B</b> : creates a book (WIP)</Text >
            <Text><b>E</b> : interact w/ a screen, book, portal, ...</Text >
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            fullWidth
            value="Close"
            onClick={handleClose}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default HelpModal
