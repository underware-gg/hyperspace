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
  Input,
  Box,
} from '@chakra-ui/react'
import { getLocalStore, getRemoteStore } from '@/core/singleton'
import { getGameCanvasElement } from '@/core/game-canvas'
import { useDocument, useLocalDocument } from '@/hooks/useDocument'
import Button from '@/components/Button'
import Editable from '@/components/Editable'
import Textarea from '@/components/Textarea'
import { SliderProgress, SliderPage } from '@/components/Sliders'
import * as Screen from '@/core/components/screen'

const ModalScreenEdit = ({
  screenId,
}) => {
  const editingScreenId = useLocalDocument('screens', 'editing')
  const screen = useDocument('screen', screenId)
  const pageCount = useLocalDocument('page-count', editingScreenId) ?? 1
  // console.log(screen)

  const initialRef = useRef(null)
  const finalRef = useRef(null)

  const router = useRouter()
  const { slug } = router.query

  useEffect(() => {
    finalRef.current = getGameCanvasElement()
  }, [])

  const _renameScreen = (value) => {
    Screen.updateScreen(screenId, {
      name: value,
    })
  }

  const _onContentChange = (e) => {
    const content = e.target.value
    Screen.updateScreen(screenId, {
      content,
    })
  }

  const _onProgressChange = (value) => {
    Screen.updateScreen(screenId, {
      page: value,
    })
  }

  const _openDocumentLink = () => {
    const url = `/${slug}/documents/${screen?.name}`
    window.open(url, '_blank', 'noreferrer')
  }

  const _handleClose = () => {
    const store = getLocalStore()
    store.setDocument('screens', 'editing', null)
  }

  const isOpen = (editingScreenId != null && editingScreenId == screenId)
  const isMultiline = Screen.isMultiline(screen?.type)
  const hasProgressControl = Screen.hasProgressControl(screen?.type)
  const hasPageControl = Screen.hasPageControl(screen?.type)

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
        maxW='56rem'
        backgroundColor='#000a'
      >
        <ModalHeader>
          <HStack>
            <Text>{screen?.type}:</Text>
            {screen?.name
              ? <Editable currentValue={screen.name} onSubmit={(value) => _renameScreen(value)} />
              : <Text color='important'>???</Text>
            }
            <Spacer />
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          {isMultiline ? 
            <Textarea
              ref={initialRef}
              value={screen?.content ?? `Screen [${screenId}] not found`}
              onChange={(e) => _onContentChange(e)}
              disabled={!screen}
            />
            :
            <Input
              value={screen?.content ?? `Screen [${screenId}] not found`}
              onChange={(e) => _onContentChange(e)}
              disabled={!screen}
            />

          }
          {hasProgressControl &&
            <SliderProgress defaultValue={screen?.page} onChange={(value) => _onProgressChange(value)} />
          }
          {hasPageControl &&
            <SliderPage defaultValue={screen?.page} pageCount={pageCount} onChange={(value) => _onProgressChange(value)} />
          }
        </ModalBody>
        <ModalFooter>
          <Button
            variant='outline'
            value='Document Link'
            disabled={!screen?.name}
            onClick={() => _openDocumentLink()}
          />
          <Spacer />
          <Text>document id: {screenId}</Text>
          <Spacer />
          <Button
            variant='outline'
            value='Close'
            onClick={() => _handleClose()}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalScreenEdit
