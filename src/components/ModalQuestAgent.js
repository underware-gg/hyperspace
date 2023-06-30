import React, { useState, useEffect, useRef } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  Spacer,
  HStack,
} from '@chakra-ui/react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useSlugs } from '@/hooks/useSlugs'
import { ChatDialog, OpenAISetup, useKeys } from 'endlessquestagent'
import { Button } from '@/components/Button'
import useProfile from '@/hooks/useProfile'


const ModalQuestAgent = ({
  disclosure,
}) => {
  const { keysAreOk } = useKeys()
  const { isOpen, onOpen, onClose } = disclosure
  const { slug } = useSlugs()
  const { metadataStore } = useRoomContext()
  const { profileName } = useProfile(null)

  useEffect(() => {
    if (isOpen) {
    }
  }, [isOpen])

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose()}
      // initialFocusRef={roomNameRef}
      // finalFocusRef={finalRef}
      isCentered
      size='full'
    >
      <ModalOverlay />
      <ModalContent
        backgroundColor='#000a'
      >
        <ModalHeader>
          Endless Quest
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <HStack>
            <Spacer />

            <Tabs isFitted variant='enclosed' w='530px'>
              <TabList mb='1em'>
                {keysAreOk &&
                  <Tab _selected={{ bg: 'teal' }}>Agent</Tab>
                }
                <Tab _selected={{ bg: 'teal' }}>Setup</Tab>
              </TabList>
              <TabPanels>
                {keysAreOk &&
                  <TabPanel>
                    <ChatDialog
                      store={metadataStore}
                      realmCoord={1n}
                      chamberSlug={slug}
                      isChatting={true}
                      onStopChatting={onClose}
                      playerName={profileName}
                    />
                  </TabPanel>
                }
                <TabPanel>
                  <OpenAISetup />
                </TabPanel>
              </TabPanels>
            </Tabs>

            <Spacer />
          </HStack>
        </ModalBody>
        <ModalFooter>
          {/* <Spacer /> */}
          <Button
            variant='outline'
            value='Close'
            onClick={() => onClose()}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalQuestAgent
