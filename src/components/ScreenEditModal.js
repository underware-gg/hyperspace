import React, { useState, useEffect, useRef } from 'react'
import {
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import { getLocalStore, getRemoteStore } from '@/core/singleton'
import { getGameCanvasElement } from '@/core/game-canvas'
import useLocalDocument from '@/hooks/useLocalDocument'
import Textarea from '@/components/Textarea'
import Button from '@/components/Button'
import * as Screen from '@/core/components/screen'

const ScreenEditModal = ({
  screenId,
}) => {
  const [content, setContent] = useState('')
  const editingScreenId = useLocalDocument('screens', 'editing')
  const initialRef = useRef(null)
  const finalRef = useRef(null)

  useEffect(() => {
    finalRef.current = getGameCanvasElement()
  }, [])

  useEffect(() => {
    const remoteStore = getRemoteStore();
    const screen = remoteStore.getDocument('screen', screenId);
    setContent(screen?.content ?? `Screen [${screenId}] not found`)
  }, [screenId])

  const _onContentChange = (e) => {
    const newContent = e.target.value
    Screen.setContent(screenId, newContent)
    setContent(newContent)
  }

  const _handleClose = () => {
    const store = getLocalStore()
    store.setDocument('screens', 'editing', null)
  }

  const isOpen = (editingScreenId != null && editingScreenId == screenId)

  return (
    <Modal
      initialFocusRef={initialRef}
      finalFocusRef={finalRef}
      isOpen={isOpen}
      // onAfterOpen={() => _onAfterOpen()}
      onClose={() => _handleClose()}
      isCentered
      size='xl'
    >
      <ModalOverlay />
      <ModalContent
        backgroundColor='#0008'
      >
        <ModalHeader>
          Screen Editor
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <Textarea
            ref={initialRef}
            value={content}
            onChange={(e) => _onContentChange(e)}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            value="Close"
            onClick={() => _handleClose()}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ScreenEditModal
