import React, { useState, useRef, useEffect } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  VStack,
  Input,
  Text,
} from '@chakra-ui/react'
import Button from '@/components/Button'
import { validateRoomSlug } from '@/core/utils'

const ModalRoom = ({
  disclosure,
  onSubmit,
}) => {
  const { isOpen, onOpen, onClose } = disclosure
  const [roomName, setRoomName] = useState('');
  const [isValid, setIsValid] = useState(false);
  const roomNameRef = useRef()

  useEffect(() => {
    setIsValid(roomName.length == 0 || validateRoomSlug(roomName))
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
              focusBorderColor='teal.500'
              placeholder=''
              ref={roomNameRef}
              value={roomName}
              onChange={(e) => _onChange(e.target.value)}
              onKeyDown={(e) => { if (e.code == 'Enter') onSubmit(roomName) }}
            />
            <Text>{isValid ? <span>&nbsp;</span> : 'invalid room name'}</Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant='outline'
            fullWidth
            value={roomName.length > 0 ? 'Create / Enter Room' : 'Create Casual Room'}
            onClick={() => onSubmit(roomName)}
            disabled={!isValid}
            type='submit'
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalRoom
