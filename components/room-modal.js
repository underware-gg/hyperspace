import React, { useState } from 'react'
import {
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
} from '@chakra-ui/react'
import Button from 'components/button'
import { getLocalStore, getRemoteStore } from 'core/singleton'

const RoomModal = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [roomName, setRoomName] = useState('');

  return (
    <Modal
      isOpen={isOpen}
      // onAfterOpen={() => onAfterOpen()}
      onClose={() => onClose()}
      isCentered
    >
      <ModalOverlay
        bg='none'
        backdropFilter='auto'
        backdropBlur='6px'
      />
      <ModalContent boxShadow='dark-lg'>
        <ModalHeader>
          Room Name
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <VStack spacing={4}>
            <Textarea
              minH='unset'
              overflowY='auto'
              w='100%'
              resize='none'
              placeholder=''
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant='outline'
            fullWidth
            value={roomName.length > 0 ? 'Create / Enter Room' : 'Create Casual Room'}
            onClick={() => onSubmit(roomName)}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default RoomModal
