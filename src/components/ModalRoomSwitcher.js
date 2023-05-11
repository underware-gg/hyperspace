import React from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  HStack, VStack,
  Text,
  Spacer,
} from '@chakra-ui/react'
import { useSlugs } from '@/hooks/useSlugs'
import { useRoomContext } from '@/hooks/RoomContext'
import Button from '@/components/Button'

const ModalRoomSwitcher = ({
  isOpen,
  handleClose,
}) => {
  const { slug, key, server } = useSlugs()
  const _key = key ?? 'Global'
  const _keyClass = key ? 'Important' : null

  const { agentId, room, actions } = useRoomContext()

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
          Keyboard shortcuts
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>

          <HStack>
            <Text className='NoMargin'>Room: <span className='Important'>{slug}</span></Text>
            <Spacer />
          </HStack>
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
          <Button
            variant='outline'
            fullWidth
            value='Close'
            onClick={handleClose}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalRoomSwitcher
