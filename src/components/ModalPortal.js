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
import * as Player from '@/core/components/player'

const ModalPortal = ({
  disclosure,
  portalId,
  onSubmit,
}) => {
  const { isOpen, onOpen, onClose } = disclosure
  const [roomName, setRoomName] = useState('');
  const [tileX, setTileX] = useState(Player.defaultEntryTile.x);
  const [tileY, setTileY] = useState(Player.defaultEntryTile.y);
  const roomNameRef = useRef()
  const finalRef = useRef(null)

  useEffect(() => {
    finalRef.current = getGameCanvasElement()
  }, [])

  const portal = useDocument('portal', portalId)

  useEffect(() => {
    if (isOpen) {
      setRoomName(portal?.slug ?? '')
      setTileX(portal?.tile?.x ?? Player.defaultEntryTile.x)
      setTileY(portal?.tile?.y ?? Player.defaultEntryTile.y)
    }
  }, [portal, isOpen])

  const _onChangeX = (value) => {
    const v = parseInt(value)
    if (!isNaN(v)) {
      setTileX(v)
    }
  }

  const _onChangeY = (value) => {
    const v = parseInt(value)
    if (!isNaN(v)) {
      setTileY(v)
    }
  }

  const _onSave = () => {
    onSubmit(roomName, tileX, tileY)
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
                focusBorderColor='teal.500'
                placeholder=''
                ref={roomNameRef}
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </HStack>
            <HStack>
              <Text w='170px'>Entry</Text>
              <Text>X:</Text>
              <Input
                focusBorderColor='teal.500'
                placeholder=''
                value={tileX}
                onChange={(e) => _onChangeX(e.target.value)}
              />
              <Text>Y:</Text>
              <Input
                focusBorderColor='teal.500'
                placeholder=''
                value={tileY}
                onChange={(e) => _onChangeY(e.target.value)}
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
