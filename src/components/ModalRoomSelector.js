import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  VStack,
  Spacer,
} from '@chakra-ui/react'
import { MapPreviewFromSlugToRoomContext } from '@/components/Map2D'
import Button from '@/components/Button'
import SlugSelector from '@/components/SlugSelector'

const ModalRoom = ({
  disclosure,
  onSubmit,
}) => {
  const { isOpen, onOpen, onClose } = disclosure
  const selectorRef = useRef()
  const [slug, setSlug] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const router = useRouter()

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
            <SlugSelector selectedValue={slug} onChange={setSlug} />
            <MapPreviewFromSlugToRoomContext slug={slug} onLoaded={setLoaded} />
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
            variant='outline'
            fullWidth
            value={'Enter Room'}
            disabled={!slug || !loaded}
            onClick={() => onSubmit(slug)}
            type='submit'
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalRoom
