import React, { useEffect } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  HStack, VStack,
  Text,
  Spacer,
  useDisclosure,
} from '@chakra-ui/react'
import { useSlugs } from '@/hooks/useSlugs'
import { useRoomContext } from '@/hooks/RoomContext'
import ModalRoomCreate from '@/components/ModalRoomCreate'
import ModalRoomSelector from '@/components/ModalRoomSelector'
import Button from '@/components/Button'

const ModalRoomSwitcher = ({
  isOpen,
  handleClose,
}) => {
  const { room } = useRoomContext()
  const { slug, key, server } = useSlugs()
  const _key = key ?? 'Global'
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
    if (!isOpen) {
      disclosureNewRoom.onClose()
      disclosureSelectRoom.onClose()
    }
  }, [isOpen])

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
          <Text className='NoMargin'>Room: <span className='Important'>{slug}</span></Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>

          <Text className='NoMargin'>Key:  <span className={_keyClass}>{_key}</span></Text>
          <Text className='NoMargin'>Server: {server}</Text>

          <Button
            fullWidth
            value='Revert Room'
            disabled={key == null}
            onClick={() => _revertRoom()}
          />

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
