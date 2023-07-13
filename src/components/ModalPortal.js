import React, { useState, useEffect, useRef } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  VStack, HStack,
  Input,
  Spacer,
  Text,
} from '@chakra-ui/react'
import {
  validateRoomSlug,
} from 'hyperbox-sdk'
import { useRoomContext } from '@/hooks/RoomContext'
import { useRemoteDocument } from '@/hooks/useDocument'
import useGameCanvas from '@/hooks/useGameCanvas'
import { TileInput, useInputValidator } from '@/components/Inputs'
import { DEFAULT_ENTRY } from '@/core/components/map'
import { Button } from '@/components/Button'

const ModalPortal = ({
  disclosure,
  portalId,
  newPortal=false
}) => {
  const { Portal, actions } = useRoomContext()
  const { gameCanvas } = useGameCanvas()
  const { isOpen, onOpen, onClose } = disclosure
  const [roomName, setRoomName] = useState('');
  const [tileX, setTileX] = useState(DEFAULT_ENTRY.x);
  const [tileY, setTileY] = useState(DEFAULT_ENTRY.y);
  const validator = useInputValidator()
  const roomNameRef = useRef()
  const finalRef = useRef()

  useEffect(() => {
    if (isOpen) {
      finalRef.current = gameCanvas
    }
  }, [isOpen])

  const portal = useRemoteDocument('portal', portalId)

  useEffect(() => {
    if (isOpen) {
      setRoomName(portal?.slug ?? '')
      setTileX(portal?.tile?.x ?? DEFAULT_ENTRY.x)
      setTileY(portal?.tile?.y ?? DEFAULT_ENTRY.y)
    }
  }, [portal, isOpen])

  const _onSave = () => {
    const options = {
      slug: roomName,
      tile: {
        x: tileX,
        y: tileY,
      }
    }
    if (newPortal) {
      actions.emitAction('createPortal', options)
    } else {
      Portal.updatePortal(portalId, options)
    }
    onClose()
  }

  const _setRoomName = (name) => {
    setRoomName(name)
  }

  const roomNameIsValid = validateRoomSlug(roomName)

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
              <Text w='125px'>To Room:</Text>
              <Input
                focusBorderColor={roomNameIsValid ? 'teal.500' : 'crimson'}
                placeholder=''
                ref={roomNameRef}
                value={roomName}
                onChange={(e) => _setRoomName(e.target.value)}
              />
            </HStack>
            <TileInput
              name='Entry'
              valueX={tileX}
              valueY={tileY}
              onChangeX={setTileX}
              onChangeY={setTileY}
              validator={validator}
            />
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
            disabled={!validator.isValid || !roomNameIsValid}
            onClick={() => _onSave()}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalPortal
