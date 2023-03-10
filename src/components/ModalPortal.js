import React, { useState, useEffect, useRef } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  VStack, HStack,
  Input,
  Spacer,
  Text,
} from '@chakra-ui/react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useDocument } from '@/hooks/useDocument'
import { getGameCanvasElement } from '@/core/game-canvas'
import { TileInput, useInputValidator } from '@/components/Inputs'
import Button from '@/components/Button'
import { emitAction } from '@/core/controller'
import { defaultSettings } from '@/core/components/settings'

const ModalPortal = ({
  disclosure,
  portalId,
  newPortal=false
}) => {
  const { Portal } = useRoomContext()
  const { isOpen, onOpen, onClose } = disclosure
  const [roomName, setRoomName] = useState('');
  const [tileX, setTileX] = useState(defaultSettings.entry.x);
  const [tileY, setTileY] = useState(defaultSettings.entry.y);
  const validator = useInputValidator()
  const roomNameRef = useRef()
  const finalRef = useRef(null)


  useEffect(() => {
    finalRef.current = getGameCanvasElement()
  }, [])

  const portal = useDocument('portal', portalId)

  useEffect(() => {
    if (isOpen) {
      setRoomName(portal?.slug ?? '')
      setTileX(portal?.tile?.x ?? defaultSettings.entry.x)
      setTileY(portal?.tile?.y ?? defaultSettings.entry.y)
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
      emitAction('createPortal', options)
    } else {
      Portal.updatePortal(portalId, options)
    }
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
              <Text w='125px'>To Room:</Text>
              <Input
                focusBorderColor='teal.500'
                placeholder=''
                ref={roomNameRef}
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
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
            disabled={!validator.isValid}
            onClick={() => _onSave()}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalPortal
