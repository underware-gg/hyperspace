import React, { useState, useEffect, useRef } from 'react'
import {
  VStack,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  Spacer,
  Text,
} from '@chakra-ui/react'
import { useDocument } from '@/hooks/useDocument'
import { getGameCanvasElement } from '@/core/game-canvas'
import Button from '@/components/Button'

const ModalPortal = ({
  disclosure,
  portalId,
  onSubmit,
}) => {
  const { isOpen, onOpen, onClose } = disclosure
  const [roomName, setRoomName] = useState('');
  const roomNameRef = useRef()
  const finalRef = useRef(null)

  useEffect(() => {
    finalRef.current = getGameCanvasElement()
  }, [])

  const portal = useDocument('portal', portalId)

  useEffect(() => {
    if (isOpen) {
      setRoomName(portal?.slug ?? '')
    }
  }, [portal, isOpen])

  const _onSave = () => {
    onSubmit(roomName)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose()}
      initialFocusRef={roomNameRef}
      finalFocusRef={finalRef}
      isCentered
      size='lg'
    >
      <ModalOverlay />
      <ModalContent
        backgroundColor='#000a'
      >
        <ModalHeader>
          {portalId ? 'Edit' : 'New'} Portal
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <VStack spacing={4} align='stretch'>
            <HStack>
              <Text w='100px'>To Room:</Text>
              <Input
                w='100%'
                focusBorderColor='teal.500'
                placeholder=''
                ref={roomNameRef}
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant='outline'
            value='Cancel'
            onClick={() => onClose()}
          />
          <Spacer />
          {portalId && <Text>portal id: {portalId}</Text>}
          <Spacer />
          <Button
            variant='outline'
            value='Save'
            onClick={() => _onSave()}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalPortal
