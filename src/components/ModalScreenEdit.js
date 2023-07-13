import React, { useEffect, useRef, useMemo } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  HStack,
  Spacer,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useSettingsContext } from '@/hooks/SettingsContext'
import { useRoomContext } from '@/hooks/RoomContext'
import { useRemoteDocument } from '@/hooks/useDocument'
import useGameCanvas from '@/hooks/useGameCanvas'
import usePermission from '@/hooks/usePermission'
import { Button } from '@/components/Button'
import Editable from '@/components/Editable'
import ScreenEditor from '@/components/ScreenEditor'
import { PermissionsForm } from '@/components/PermissionsForm'
import { MapPreview } from '@/components/Map2D'
import { ScreenComponent } from '@/components/Screens'
import { makeRoute } from '@/core/utils/routes'

const ModalScreenEdit = ({
  screenId,
}) => {
  const { editorPreview } = useSettingsContext()
  const { remoteStore, localStore, slug, Screen } = useRoomContext()
  const { gameCanvas } = useGameCanvas()
  const { permission, isOwner, canEdit, canView } = usePermission(screenId)
  const screen = useRemoteDocument('screen', screenId)

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
      size='full'
    >
      <ModalOverlay />
      <ModalContent
        // maxW='56rem'
        backgroundColor={editorPreview ? '#000' : '#000a'}
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

        <ModalBody pb={4} minHeight='300px' className='ScreenModalContainer'>

          <div className='FillParent Relative'>

            <Tabs isFitted variant='enclosed' className='ScreenModalColumnLeft'>
              <TabList mb='1em'>
                <Tab _selected={{ bg: 'teal' }}>Edit</Tab>
                <Tab _selected={{ bg: 'teal' }}>Permissions</Tab>
              </TabList>

              <TabPanels className='FillParent'>
                <TabPanel className=''>
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

            <VStack className='ScreenModalColumnRight Padded'>
              {editorPreview &&
                <>
                  <div className='ScreenModalMapPreview'>
                    <MapPreview store={remoteStore} />
                  </div>
                  <div className='ScreenModalPreview'>
                    <ScreenComponent screenId={screenId} />
                  </div>
                </>
              }
            </VStack>

          </div>


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
