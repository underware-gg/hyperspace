import React, { useEffect, useRef, useMemo } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  HStack,
  Spacer,
  Text,
} from '@chakra-ui/react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useDocument } from '@/hooks/useDocument'
import useGameCanvas from '@/hooks/useGameCanvas'
import usePermission from '@/hooks/usePermission'
import Button from '@/components/Button'
import Editable from '@/components/Editable'
import ScreenEditor from '@/components/ScreenEditor'
import { PermissionsForm } from '@/components/PermissionsForm'
import { makeRoute } from '@/core/routes'

const ModalScreenEdit = ({
  screenId,
}) => {
  const { localStore, slug, Screen } = useRoomContext()
  const { gameCanvas } = useGameCanvas()
  const { permission, isOwner, canEdit, canView } = usePermission(screenId)
  const screen = useDocument('screen', screenId)

  const isOpen = useMemo(() => (screenId != null && canEdit), [screenId, canEdit])

  const initialFocusRef = useRef(null)
  const finalRef = useRef()

  useEffect(() => {
    if (isOpen) {
      finalRef.current = gameCanvas
    }
  }, [isOpen])

  const _renameScreen = (value) => {
    Screen.updateScreen(screenId, {
      name: value,
    })
  }

  const _openDocumentLink = () => {
    const url = makeRoute({
      slug,
      documentName: screen?.name ?? null,
    })
    window.open(url, '_blank', 'noreferrer')
  }

  const _handleClose = () => {
    if (!localStore) return
    localStore.setDocument('screens', 'editing', null)
  }

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
