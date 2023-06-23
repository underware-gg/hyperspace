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
import {
  validateRoomSlug,
} from 'hyperbox-sdk'
import { useStoreDocument } from '@/hooks/useDocument'
import { useDbRooms } from '@/hooks/useApi'
import { useClientRoom } from '@/hooks/useRoom'
import { Button } from '@/components/Button'
import { useInputValidator } from '@/components/Inputs'
import { makeRoute } from '@/core/utils/routes'
import { DEFAULT_ENTRY } from '@/core/components/map'

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
      const slug = _isCasual ? nanoid().toLowerCase() : roomName
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
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Text>{!roomIsValid ? 'Invalid room name' : !validator.isValid ? 'Invalid room size' : <span>&nbsp;</span>}</Text>
          <Spacer />
          {!roomSlug ?
            <Button
              fullWidth
              value={_isCasual ? 'Create Casual Room' : roomExists ? 'Enter Room' : 'Create Room'}
              onClick={() => _enterRoom()}
              disabled={!_canSubmit}
              type='submit'
            />
            : <RoomCreator slug={roomSlug} />
          }
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalRoomCreate

const RoomCreator = ({
  slug,
}) => {
  const router = useRouter()

  const { store } = useClientRoom(slug)

  useEffect(() => {
    if (store) {
      const settings = {
        timestamp: Date.now(),
        entry: DEFAULT_ENTRY,
      }
      console.log(`New Room [${slug}] settings:`, settings)
      store.setDocument('settings', 'world', settings)
    }
  }, [store])

  const settings = useStoreDocument('settings', 'world', store)

  useEffect(() => {
    if (settings) {
      router.push(makeRoute({ slug }))
    }
  }, [settings])

  return (
    <Button
      fullWidth
      value='Creating Room...'
      onClick={() => _enterRoom()}
      disabled={true}
    />
  )
}
