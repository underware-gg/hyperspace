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
        backgroundColor='#0008'
      >
        <ModalHeader>
          Keyboard shortcuts
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <VStack spacing={1} isCentered={false}>
            <Text>◀️🔼🔽▶️ : move (2D) / walk+turn (3D)</Text>
            <Text><b>WASD</b> : move (2D) /  walk+straffe (3D)</Text>
            <Text><b>IJKL</b> : look around (3D)</Text>
            <Text><b>SPACE</b> : jump</Text>
            <Text><b>0-9</b> : paint tiles on the map</Text>
            <Text><b>T</b> : switches between 2D/3D view</Text>
            <Text><b>E</b> : interacts (w/ a screen, portal, book)</Text >
            <Text><b>P</b> : creates a portal</Text >
            <Text><b>B</b> : creates a book (WIP)</Text >
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
