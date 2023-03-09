import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  HStack,
  Spacer,
  Input,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { useDocument } from '@/hooks/useDocument'
import { PermissionsForm } from '@/components/PermissionsForm'
import { TileInput, useInputValidator } from '@/components/Inputs'
import Button from '@/components/Button'
import * as Settings from '@/core/components/settings'
import { defaultSettings } from '@/core/components/settings'


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
  const router = useRouter()
  const { slug } = router.query
  const { id, isOpen, onClose } = settingsDisclosure

  const [sizeX, setSizeX] = useState(defaultSettings.size.width);
  const [sizeY, setSizeY] = useState(defaultSettings.size.height);
  const [tileX, setTileX] = useState(defaultSettings.entry.x);
  const [tileY, setTileY] = useState(defaultSettings.entry.y);
  const validator = useInputValidator()

  const settings = useDocument('settings', id)

  useEffect(() => {
    if (settings) {
      setTileX(settings.entry.x)
      setTileY(settings.entry.y)
    }
  }, [settings])

  const _onSave = () => {
    let options = {
      entry: {
        x: parseInt(tileX),
        y: parseInt(tileY),
      }
    }
    if (newRoom) {
      // TODO: NEW ROOM
      options.size = {
        width: sizeX,
        height: sizeY,
      }
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
                  name='Map Size'
                  valueX={sizeX}
                  valueY={sizeY}
                  onChangeX={setSizeX}
                  onChangeY={setSizeY}
                  validator={validator}
                  disabled={!newRoom}
                />
                <Spacer pt={3} />
                <TileInput
                  name='Entry'
                  valueX={tileX}
                  valueY={tileY}
                  onChangeX={setTileX}
                  onChangeY={setTileY}
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
            value='Save'
            disabled={!validator.isValid}
            onClick={() => _onSave()}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

