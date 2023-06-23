import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { nanoid } from 'nanoid'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  VStack,
  Spacer,
} from '@chakra-ui/react'
import { makeRoute } from '@/core/utils/routes'
import { MapPreviewFromSlugToRoomContext } from '@/components/Map2D'
import SlugSelector from '@/components/SlugSelector'
import { Button } from '@/components/Button'

const ModalRoomSelector = ({
  disclosure,
}) => {
  const { isOpen, onOpen, onClose } = disclosure
  const selectorRef = useRef()
  const [newSlug, setNewSlug] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const router = useRouter()

  function _enterRoom() {
    disclosure.onClose()
    const slug = newSlug?.length > 0 ? newSlug : nanoid()
    router.push(makeRoute({ slug }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose()}
      initialFocusRef={selectorRef}
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
            <SlugSelector selectedValue={newSlug} onChange={setNewSlug} />
            <MapPreviewFromSlugToRoomContext slug={newSlug} onLoaded={setLoaded} />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant='outline'
            fullWidth
            value={'Dual Rooms Demo'}
            onClick={() => router.push(`/pages/dual`)}
          />
          <Spacer />
          <Button
            fullWidth
            value={'Enter Room'}
            disabled={!newSlug || !loaded}
            onClick={() => _enterRoom()}
            type='submit'
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalRoomSelector
