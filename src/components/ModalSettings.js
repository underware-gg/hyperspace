import React, { useState, useEffect } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  HStack,
  Spacer,
  Input,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { DEFAULT_ENTRY, MAX_MAP_SIZE } from '@/core/components/map'
import { useRoomContext } from '@/hooks/RoomContext'
import { useRemoteDocument } from '@/hooks/useDocument'
import usePermission from '@/hooks/usePermission'
import { PermissionsForm } from '@/components/PermissionsForm'
import { TileInput, useInputValidator } from '@/components/Inputs'
import { Button } from '@/components/Button'


export const useSettingsDisclosure = (id) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return {
    openSettings: onOpen,
    isOpen, onClose,
    id,
  }
}

export const ModalSettings = ({
  type,
  settingsDisclosure,
  newRoom = false
}) => {
  const { Settings, Map, slug } = useRoomContext()
  const { id, isOpen, onClose } = settingsDisclosure
  const { canEdit } = usePermission('world')

  const [entryX, setEntryX] = useState(DEFAULT_ENTRY.x);
  const [entryY, setEntryY] = useState(DEFAULT_ENTRY.y);
  const validator = useInputValidator()

  const settings = useRemoteDocument('settings', id)

  useEffect(() => {
    if (settings) {
      setEntryX(settings.entry.x)
      setEntryY(settings.entry.y)
    }
  }, [settings])

  const _onReset = () => {
    Map.resetMap('world')
  }

  const _onSave = () => {
    let options = {
      entry: {
        x: parseInt(entryX),
        y: parseInt(entryY),
      }
    }
    if (newRoom) {
    } else {
      Settings.updateSettings(id, options)
    }
    onClose()
  }

  return (
    <Modal
      // initialFocusRef={initialRef}
      // finalFocusRef={finalRef}
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size='lg'
    >
      <ModalOverlay />
      <ModalContent
        maxW='40rem'
        backgroundColor='#000a'
      >
        <ModalHeader>
          {type} Settings
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4} minHeight='300px'>
          <Tabs isFitted variant='enclosed'>
            <TabList mb='1em'>
              <Tab _selected={{ bg: 'teal' }}>Settings</Tab>
              <Tab _selected={{ bg: 'teal' }}>Permissions</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <HStack>
                  <Text w='125px'>Room Name:</Text>
                  <Input
                    value={slug}
                    disabled={true}
                  />
                </HStack>
                <Spacer pt={3} />
                <TileInput
                  name='Entry'
                  valueX={entryX}
                  valueY={entryY}
                  minX={0}
                  minY={0}
                  maxX={MAX_MAP_SIZE.width -1}
                  maxY={MAX_MAP_SIZE.height-1}
                  onChangeX={setEntryX}
                  onChangeY={setEntryY}
                  validator={validator}
                />
              </TabPanel>
              <TabPanel>
                <PermissionsForm type={type} name={slug} id={id} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button
            variant='outline'
            value='RESET Map'
            colorScheme='red'
            disabled={!canEdit}
            onClick={() => _onReset()}
          />
          <Spacer />
          <Button
            variant='outline'
            value='Save'
            disabled={!canEdit || !validator.isValid}
            onClick={() => _onSave()}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

