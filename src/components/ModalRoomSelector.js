import React, { useState, useRef } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  VStack,
} from '@chakra-ui/react'
import Button from '@/components/Button'
import Map2D from '@/components/Map2D'
import SlugSelector from '@/components/SlugSelector'

const ModalRoom = ({
  disclosure,
  onSubmit,
}) => {
  const { isOpen, onOpen, onClose } = disclosure
  const selectorRef = useRef()
  const [slug, setSlug] = useState(null)
  const [loaded, setLoaded] = useState(false)

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
            <SlugSelector onChange={setSlug} />
            <Map2D slug={slug} onLoaded={setLoaded} />
          </VStack>
        </ModalBody>
        <ModalFooter>
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
