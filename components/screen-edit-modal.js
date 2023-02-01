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
import { getLocalStore, getRemoteStore } from 'core/singleton'
import useDocument from 'hooks/use-document'
import useLocalDocument from 'hooks/use-local-document'
import Textarea from 'components/textarea'
import Button from 'components/button'
import * as Screen from '../core/components/screen'

const ScreenEditModal = ({
  screenId,
}) => {
  const [content, setContent] = useState('')
  const editingScreenId = useLocalDocument('screens', 'editing')
  const initialRef = useRef(null)

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
      isOpen={isOpen}
      // onAfterOpen={() => _onAfterOpen()}
      onClose={() => _handleClose()}
      isCentered
      size='xl'
    >
      <ModalOverlay />
      <ModalContent
        backgroundColor='#0008'
        ref={initialRef}
      >
        <ModalHeader>
          Document editor
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <Textarea
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
