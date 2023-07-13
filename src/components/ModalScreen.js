import React, { useState, useEffect, useRef } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  VStack, HStack,
  Input,
  Spacer,
  Text,
  Select,
} from '@chakra-ui/react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useRemoteDocument } from '@/hooks/useDocument'
import { useSlugs } from '@/hooks/useSlugs'
import useGameCanvas from '@/hooks/useGameCanvas'
import { Button } from '@/components/Button'
import { TYPE } from '@/core/components/screen'


const ScreenTypeSelector = ({
  disabled = false,
  value = null,
  onSelected = (value) => { },
}) => {
  const { slug, isQuest } = useSlugs()
  return (
    <Select
      // w='400px'
      // size='sm'
      disabled={disabled}
      value={value ?? ''}
      onChange={(e) => onSelected(e.target.value)}
    >
      <option value={TYPE.DOCUMENT}>Markdown Document</option>
      {isQuest &&
        <option value={TYPE.METADATA}>Endless Quest Metadata</option>
      }
    </Select>
  )
}



const ModalScreen = ({
  disclosure,
  screenId,
}) => {
  const { Screen, actions } = useRoomContext()
  const { gameCanvas } = useGameCanvas()
  const { isOpen, onOpen, onClose } = disclosure
  const [screenType, setScreenType] = useState('')
  const [screenName, setScreenName] = useState('')

  const roomNameRef = useRef()
  const finalRef = useRef()

  useEffect(() => {
    if (isOpen) {
      setScreenType(TYPE.DOCUMENT)
      finalRef.current = gameCanvas
    }
  }, [isOpen])

  // const screen = useRemoteDocument('screen', screenId)
  // const newScreen = (screen == null)
  const screen = null
  const newScreen = true


  useEffect(() => {
    if (isOpen) {
      setScreenName(screen?.name ?? '')
    }
  }, [screen, isOpen])

  const _onSave = () => {
    const options = {
      name: screenName,
      type: screenType,
    }
    if (newScreen) {
      actions.emitAction('createScreen', options)
    } else {
      // Screen.updateScreen(screenId, options)
    }
    onClose()
  }

  const _setRoomName = (name) => {
    setScreenName(name)
  }

  const screenNameIsValid = (screenName?.length > 0)

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose()}
      initialFocusRef={roomNameRef}
      finalFocusRef={finalRef}
      isCentered
      size='lg'
    >
      <ModalOverlay />
      <ModalContent
        backgroundColor='#000a'
      >
        <ModalHeader>
          {screenId ? 'Edit' : 'New'} Screen
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <VStack spacing={4} align='stretch'>
            <HStack>
              <Text w='150px'>Screen Type:</Text>
              <ScreenTypeSelector
                value={screenType}
                onSelected={(value) => setScreenType(value)}
              />
            </HStack>
            <HStack>
              <Text w='150px'>Screen Name:</Text>
              <Input
                focusBorderColor={screenNameIsValid ? 'teal.500' : 'crimson'}
                placeholder=''
                ref={roomNameRef}
                value={screenName}
                onChange={(e) => _setRoomName(e.target.value)}
              />
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant='outline'
            value='Cancel'
            onClick={() => onClose()}
          />
          <Spacer />
          {screenId && <Text>screen id: {screenId}</Text>}
          <Spacer />
          <Button
            variant='outline'
            value='Save'
            disabled={!screenNameIsValid}
            onClick={() => _onSave()}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalScreen
