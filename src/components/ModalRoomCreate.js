import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import { nanoid } from 'nanoid'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  VStack,
  Input,
  Text,
  Spacer,
} from '@chakra-ui/react'
import Button from '@/components/Button'
import { TileInput, useInputValidator } from '@/components/Inputs'
import { useDbRooms } from '@/hooks/useApi'
import { useClientRoom } from '@/hooks/useRoom'
import { useStoreDocument } from '@/hooks/useDocument'
import { map, validateRoomSlug } from '@/core/utils'
import { defaultSettings } from '@/core/components/settings'

const ModalRoomCreate = ({
  disclosure,
}) => {
  const router = useRouter()
  const { isOpen, onOpen, onClose } = disclosure
  const { rooms } = useDbRooms()
  const [roomName, setRoomName] = useState('')
  const [roomIsValid, setRoomIsValid] = useState(false)
  const [roomExists, setRoomExists] = useState(false)
  const [roomSlug, setRoomSlug] = useState(null)
  const roomNameRef = useRef()

  const [sizeX, setSizeX] = useState(defaultSettings.size.width)
  const [sizeY, setSizeY] = useState(defaultSettings.size.height)
  const validator = useInputValidator()

  const _isCasual = (roomName.length == 0)
  const _canSubmit = (roomIsValid && validator.isValid)

  useEffect(() => {
    setRoomIsValid(roomName.length == 0 || validateRoomSlug(roomName))
    setRoomExists(rooms.includes(roomName))
  }, [roomName])

  const _onChange = (name) => {
    setRoomName(name)
  }

  function _enterRoom() {
    if (roomExists) {
      router.push(`/${roomName}`)
    } else {
      const slug = _isCasual ? nanoid() : roomName
      setRoomSlug(slug)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose()}
      initialFocusRef={roomNameRef}
      size='lg'
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
              onKeyDown={(e) => { if (e.code == 'Enter' && _canSubmit) _enterRoom() }}
            />
            <TileInput
              name='Size'
              minX={5}
              minY={5}
              maxX={20}
              maxY={20}
              valueX={sizeX}
              valueY={sizeY}
              onChangeX={setSizeX}
              onChangeY={setSizeY}
              validator={validator}
              disabled={roomExists}
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Text>{!roomIsValid ? 'Invalid room name' : !validator.isValid ? 'Invalid room size' : <span>&nbsp;</span>}</Text>
          <Spacer />
          {!roomSlug ?
            <Button
              variant='outline'
              fullWidth
              value={_isCasual ? 'Create Casual Room' : roomExists ? 'Enter Room' : 'Create Room'}
              onClick={() => _enterRoom()}
              disabled={!_canSubmit}
              type='submit'
            />
            : <RoomCreator slug={roomSlug} width={sizeX} height={sizeY} />
          }
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalRoomCreate

const RoomCreator = ({
  slug,
  width,
  height,
}) => {
  const router = useRouter()

  const { store } = useClientRoom(slug)

  useEffect(() => {
    if (store) {
      const settings = {
        size: {
          width,
          height,
        },
        entry: {
          x: Math.floor(map(defaultSettings.entry.x, 1, defaultSettings.size.width, 1, width)),
          y: Math.floor(map(defaultSettings.entry.y, 1, defaultSettings.size.height, 1, height)),
        }
      }
      console.log(`New Room [${slug}] settings:`, settings)
      store.setDocument('settings', 'world', settings)
    }
  }, [store])

  const settings = useStoreDocument('settings', 'world', store)

  useEffect(() => {
    if (settings?.size?.width == width && settings?.size?.height == height) {
      router.push(`/${slug}`)
    }
  }, [settings])

  return (
    <Button
      variant='outline'
      fullWidth
      value='Creating Room...'
      onClick={() => _enterRoom()}
      disabled={true}
    />
  )
}
