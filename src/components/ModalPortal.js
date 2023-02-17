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
import { TileField } from '@/components/ModalSettings'
import Button from '@/components/Button'
import * as Portal from '@/core/components/portal'
import * as Settings from '@/core/components/settings'

const ModalPortal = ({
  disclosure,
  portalId,
  newPortal=false
}) => {
  const { isOpen, onOpen, onClose } = disclosure
  const [roomName, setRoomName] = useState('');
  const [tileX, setTileX] = useState(Settings.defaultEntryTile.x);
  const [tileY, setTileY] = useState(Settings.defaultEntryTile.y);
  const roomNameRef = useRef()
  const finalRef = useRef(null)

  useEffect(() => {
    finalRef.current = getGameCanvasElement()
  }, [])

  const portal = useDocument('portal', portalId)

  useEffect(() => {
    if (isOpen) {
      setRoomName(portal?.slug ?? '')
      setTileX(portal?.tile?.x ?? Settings.defaultEntryTile.x)
      setTileY(portal?.tile?.y ?? Settings.defaultEntryTile.y)
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
      console.log(`EMIT portal`, options)
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
            <TileField
              name='Entry'
              valueX={tileX}
              valueY={tileY}
              onChangeX={setTileX}
              onChangeY={setTileY}
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
            onClick={() => _onSave()}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalPortal
