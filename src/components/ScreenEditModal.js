import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  HStack,
  Spacer,
  Text,
} from '@chakra-ui/react'
import { getLocalStore, getRemoteStore } from '@/core/singleton'
import { getGameCanvasElement } from '@/core/game-canvas'
import useDocument from '@/hooks/useDocument'
import useLocalDocument from '@/hooks/useLocalDocument'
import Textarea from '@/components/Textarea'
import Button from '@/components/Button'
import Editable from '@/components/Editable'
import * as Screen from '@/core/components/screen'

const ScreenEditModal = ({
  screenId,
}) => {
  const editingScreenId = useLocalDocument('screens', 'editing')
  const screen = useDocument('screen', screenId)
  // console.log(screen)

  const initialRef = useRef(null)
  const finalRef = useRef(null)

  const router = useRouter()
  const { slug } = router.query

  useEffect(() => {
    finalRef.current = getGameCanvasElement()
  }, [])

  const _renameScreen = (value) => {
    Screen.editScreen(screenId, {
      name: value,
    })
  }

  const _onContentChange = (e) => {
    const content = e.target.value
    Screen.editScreen(screenId, {
      content,
    })
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
        maxW="56rem"
        backgroundColor='#000a'
      >
        <ModalHeader>
          <HStack>
            <Text>Screen:</Text>
            <Editable currentValue={screen?.name ?? '???'} onSubmit={(value) => _renameScreen(value)} />
            <Spacer />
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <Textarea
            ref={initialRef}
            value={screen?.content ?? `Screen [${screenId}] not found`}
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
