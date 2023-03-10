import React, { useState, useEffect, useRef } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  HStack,
  Spacer,
  Text,
  Input,
  Box,
  VStack,
} from '@chakra-ui/react'
import { useRoomContext } from '@/hooks/RoomContext'
import { getGameCanvasElement } from '@/core/game-canvas'
import { useDocument, useLocalDocument } from '@/hooks/useDocument'
import usePermission from '@/hooks/usePermission'
import useVerida from '@/hooks/useVerida'
import Button from '@/components/Button'
import Editable from '@/components/Editable'
import Textarea from '@/components/Textarea'
import { PermissionsForm } from '@/components/PermissionsForm'
import { SliderProgress, SliderPage } from '@/components/Sliders'
import { getFilenameFromUrl } from '@/core/utils'
import { TYPE } from '@/core/components/screen'

const ModalScreenEdit = ({
  screenId,
}) => {
  const { localStore, slug, Screen } = useRoomContext()
  const { permission, isOwner, canEdit, canView } = usePermission(screenId)
  const screen = useDocument('screen', screenId)

  const initialFocusRef = useRef(null)
  const finalRef = useRef(null)

  useEffect(() => {
    finalRef.current = getGameCanvasElement()
  }, [])

  const _renameScreen = (value) => {
    Screen.updateScreen(screenId, {
      name: value,
    })
  }
  
  const _openDocumentLink = () => {
    const url = `/${slug}/documents/${screen?.name}`
    window.open(url, '_blank', 'noreferrer')
  }

  const _handleClose = () => {
    if (!localStore) return
    localStore.setDocument('screens', 'editing', null)
  }

  const isOpen = (screenId != null && canEdit)

  return (
    <Modal
      initialFocusRef={initialFocusRef}
      finalFocusRef={finalRef}
      isOpen={isOpen}
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
        <ModalBody pb={4} minHeight='300px'>
          <Tabs isFitted variant='enclosed'>
            <TabList mb='1em'>
              <Tab _selected={{ bg: 'teal' }}>Edit</Tab>
              <Tab _selected={{ bg: 'teal' }}>Permissions</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <ScreenEditor
                  screenId={screenId}
                  initialFocusRef={initialFocusRef}
                />
              </TabPanel>
              <TabPanel>
                <PermissionsForm
                  type={screen?.type}
                  name={screen?.name ?? '???'}
                  id={screenId}
                  disabled={screen == null}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
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


//----------------------
// Generic Screen Editor
//
const ScreenEditor = ({
  screenId,
  initialFocusRef,
}) => {
  const screen = useDocument('screen', screenId)

  if (screen?.type == TYPE.DOCUMENT) {
    return <ScreenEditorDocument screenId={screenId} initialFocusRef={initialFocusRef} />
  }

  if (screen?.type == TYPE.PDF_BOOK) {
    return <ScreenEditorPdfBook screenId={screenId} initialFocusRef={initialFocusRef} />
  }

  return (
    <div className='FillParent ScreenError'>
      Invalid screen type [{screen?.type}]
    </div>
  )
}

//---------------------------
// Specialized Screen Editors
//

const ScreenEditorDocument = ({
  screenId,
  initialFocusRef,
}) => {
  const { veridaIsConnected } = useVerida()
  const screen = useDocument('screen', screenId)

  const _onContentChange = (e) => {
    const content = e.target.value
    Screen.updateScreen(screenId, {
      content,
    })
  }

  const [isFetchingTweet, setIsFetchingTweet] = useState(false)
  const _lastTweet = async () => {
    setIsFetchingTweet(true)
    const { VeridaUser } = (await import('@/core/verida'))
    await VeridaUser.retrieveLastTweet((content) => {
      setIsFetchingTweet(false)
      console.log(content)
    })
  }

  return (
    <div>
      <VStack align='stretch'>
        <Textarea
          ref={initialFocusRef}
          value={screen?.content ?? `Screen [${screenId}] not found`}
          onChange={(e) => _onContentChange(e)}
          disabled={!screen}
        />
        <HStack>
          <Button size='sm' onClick={async () => await _lastTweet()} disabled={!veridaIsConnected || isFetchingTweet}>
            Append Last Tweet
          </Button>
          <Spacer />
        </HStack>
      </VStack>
    </div>
  )
}


const ScreenEditorPdfBook = ({
  screenId,
  initialFocusRef,
}) => {
  const screen = useDocument('screen', screenId)
  const pageCount = useLocalDocument('page-count', screenId) ?? 1

  const _onContentChange = (e) => {
    const url = e.target.value
    const name = getFilenameFromUrl(url) ?? undefined
    Screen.updateScreen(screenId, {
      content: url,
      name,
    })
  }

  const _onProgressChange = (value) => {
    Screen.updateScreen(screenId, {
      page: value,
    })
  }

  return (
    <VStack align='stretch'>
      <HStack>
        <Text>URL:</Text>
        <Input
          ref={initialFocusRef}
          value={screen?.content ?? `Screen [${screenId}] not found`}
          onChange={(e) => _onContentChange(e)}
          disabled={!screen}
        />
      </HStack>
      <SliderPage defaultValue={screen?.page} pageCount={pageCount} onChange={(value) => _onProgressChange(value)} />
    </VStack>
  )
}

