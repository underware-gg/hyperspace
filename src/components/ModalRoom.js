import React, { useState, useRef, useEffect } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  VStack,
  Input,
  Text,
  Spacer,
} from '@chakra-ui/react'
import Button from '@/components/Button'
import { useDbRooms } from '@/hooks/useApi'
import { validateRoomSlug } from '@/core/utils'

const ModalRoom = ({
  disclosure,
  onSubmit,
}) => {
  const { isOpen, onOpen, onClose } = disclosure
  const [roomName, setRoomName] = useState('');
  const [roomIsValid, setRoomIsValid] = useState(false);
  const [roomExists, setRoomExists] = useState(false);
  const roomNameRef = useRef()

  const { rooms } = useDbRooms()

  useEffect(() => {
    setRoomIsValid(roomName.length == 0 || validateRoomSlug(roomName))
    setRoomExists(rooms.includes(roomName))
  }, [roomName])

  const _onChange = (name) => {
    setRoomName(name)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose()}
      initialFocusRef={roomNameRef}
      isCentered
    >
      <ModalOverlay
        bg='none'
        backdropFilter='auto'
        backdropBlur='6px'
      />
      <ModalContent
        backgroundColor='#000a'
        boxShadow='hyperShadow'
      >
        <ModalHeader>
          Room Name
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <VStack spacing={4}>
            <Input
              w='100%'
              focusBorderColor={roomIsValid ? 'teal.500' : 'crimson'}
              placeholder=''
              ref={roomNameRef}
              value={roomName}
              onChange={(e) => _onChange(e.target.value)}
              onKeyDown={(e) => { if (e.code == 'Enter') onSubmit(roomName) }}
            />
            <Text>{roomIsValid ? <span>&nbsp;</span> : 'invalid room name'}</Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Spacer />
          <Button
            variant='outline'
            fullWidth
            value={roomName.length == 0 ? 'Create Casual Room' : roomExists ? 'Enter Room' : 'Create Room' }
            onClick={() => onSubmit(roomName)}
            disabled={!roomIsValid}
            type='submit'
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalRoom
