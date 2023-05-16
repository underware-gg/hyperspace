import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  HStack, VStack,
  Text,
  Spacer,
  Input,
  useDisclosure,
} from '@chakra-ui/react'
import { validateRoomSlug } from '@/core/utils'
import { makeRoute } from '@/core/routes'
import { useSlugs } from '@/hooks/useSlugs'
import { useRoomContext } from '@/hooks/RoomContext'
import ModalRoomCreate from '@/components/ModalRoomCreate'
import ModalRoomSelector from '@/components/ModalRoomSelector'
import Button from '@/components/Button'

const ModalRoomSwitcher = ({
  isOpen,
  handleClose,
}) => {
  const router = useRouter()
  const { room } = useRoomContext()
  const [newKey, setNewKey] = useState('')
  const { slug, key, keyName, isLocal, serverDisplay } = useSlugs()
  const _keyClass = key ? 'Important' : null

  const disclosureNewRoom = useDisclosure()
  const disclosureSelectRoom = useDisclosure()

  // detect room change
  useEffect(() => {
    if (slug) {
      handleClose()
    }
  }, [slug, key])

  useEffect(() => {
    if (isOpen) {
      setNewKey('')
    }
    if (!isOpen) {
      disclosureNewRoom.onClose()
      disclosureSelectRoom.onClose()
    }
  }, [isOpen])

  const _switchKey = (newKey, forceRevert) => {
    const pathname = makeRoute({
      slug,
      key: newKey,
    })
    router.push({
      pathname,
      query: forceRevert ? { forceRevert } : {},
    })
  }

  const _revertRoom = () => {
    room.revertToSourceRoom()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
      size='xl'
    >
      <ModalOverlay />
      <ModalContent
        backgroundColor='#000a'
      >
        <ModalHeader>
          <Text>Room: <span className='Important'>{slug}</span></Text>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={4}>
          <Text>Server: {serverDisplay}</Text>

          <hr className='HR2' />
          <HStack>
            <Text>Current Key:  <span className={_keyClass}>{keyName}</span></Text>
            <HStack className='Padded'>
              {key != null &&
                <Button
                  size='xs'
                  value='Revert State from Main'
                  variant='outline'
                  onClick={() => _revertRoom()}
                />
              }
              {key != null &&
                <Button
                  size='xs'
                  value='Open Main'
                  onClick={() => _switchKey(null)}
                />
              }
              {!isLocal &&
                <Button
                  size='xs'
                  value='Open Local'
                  onClick={() => _switchKey('local')}
                />
              }
            </HStack>
            <Spacer />
          </HStack>

          <hr className='HR0' />

          <HStack>
            <Text>Use Key:</Text>
            <Input
              size='xs'
              w='200px'
              placeholder={'enter key'}
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              onKeyDown={(e) => { if (e.code == 'Enter') _switchKey(newKey) }}
            />
            <Button
              size='xs'
              fullWidth
              value='Join'
              disabled={!validateRoomSlug(newKey)}
              onClick={() => _switchKey(newKey, false)}
            />
            <Button
              size='xs'
              fullWidth
              value='Revert and Join'
              variant='outline'
              disabled={!validateRoomSlug(newKey)}
              onClick={() => _switchKey(newKey, true)}
            />
            <Spacer />
          </HStack>

          <hr className='HR0' />
          <Text>* Keys open Room clones, preserving the original</Text>

          <hr className='HR2' />
        </ModalBody>

        <ModalFooter>
          <HStack w='100%'>
            <Button
              size='sm'
              onClick={() => disclosureSelectRoom.onOpen()}
            >
              Open Another Room
            </Button>
            <Button
              size='sm'
              onClick={() => disclosureNewRoom.onOpen()}
            >
              Create New Room
            </Button>

            <Spacer />

            <Button
              variant='outline'
              fullWidth
              value='Close'
              onClick={handleClose}
            />
          </HStack>
        </ModalFooter>

        <ModalRoomCreate disclosure={disclosureNewRoom} />

        <ModalRoomSelector disclosure={disclosureSelectRoom} />

      </ModalContent>
    </Modal>
  )
}

export default ModalRoomSwitcher
