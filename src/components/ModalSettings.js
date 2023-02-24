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
import Button from '@/components/Button'
import * as Settings from '@/core/components/settings'


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
  newRoom=false
}) => {
  const router = useRouter()
  const { slug } = router.query
  const { id, isOpen, onClose } = settingsDisclosure

  const [sizeX, setSizeX] = useState(Settings.defaultMapSize.width);
  const [sizeY, setSizeY] = useState(Settings.defaultMapSize.height);
  const [tileX, setTileX] = useState(Settings.defaultEntryTile.x);
  const [tileY, setTileY] = useState(Settings.defaultEntryTile.y);

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
        x: tileX,
        y: tileY,
      }
    }
    if (newRoom) {
      // TODO: NEW ROOM
      options.size = {
        width: sizeX,
        height: sizeY,
      }
    } else {
      Settings.update(id, options)
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
                <TileField
                  name='Map Size'
                  valueX={sizeX}
                  valueY={sizeY}
                  onChangeX={setSizeX}
                  onChangeY={setSizeY}
                  disabled={!newRoom}
                />
                <Spacer pt={3} />
                <TileField
                  name='Entry'
                  valueX={tileX}
                  valueY={tileY}
                  onChangeX={setTileX}
                  onChangeY={setTileY}
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
            onClick={() => _onSave()}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export const TileField = ({
  name = 'Tile',
  valueX,
  valueY,
  onChangeX,
  onChangeY,
  disabled=false,
}) => {

  const _onChangeX = (value) => {
    const v = parseInt(value)
    if (!isNaN(v)) {
      onChangeX(v)
    }
  }

  const _onChangeY = (value) => {
    const v = parseInt(value)
    if (!isNaN(v)) {
      onChangeY(v)
    }
  }

  return (
    <HStack>
      <Text w='220px'>{name}</Text>
      <Text>X:</Text>
      <Input
        focusBorderColor='teal.500'
        placeholder=''
        value={valueX}
        disabled={disabled}
        onChange={(e) => _onChangeX(e.target.value)}
      />
      <Text>Y:</Text>
      <Input
        focusBorderColor='teal.500'
        placeholder=''
        value={valueY}
        disabled={disabled}
        onChange={(e) => _onChangeY(e.target.value)}
      />
    </HStack>
  )
}
