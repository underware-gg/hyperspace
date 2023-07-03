import React, { useState, useEffect, useMemo } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  Spacer,
  HStack,
  Select,
} from '@chakra-ui/react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useSlugs } from '@/hooks/useSlugs'
import { ChatDialog, ChatMessages, OpenAISetup, useKeys } from 'endlessquestagent'
import { QuestEncounterDoc } from 'hyperbox-sdk'
import { Button } from '@/components/Button'
import useProfile from '@/hooks/useProfile'
import { useMetadataDocument } from '@/hooks/useDocument'


const EncounterSelector = ({
  store,
  selectedValue = '',
  chamberSlug = '',
  realmCoord = null,
  onChange,
}) => {
  useEffect(() => {
    onChange('')
  }, [])

  const options = useMemo(() => {
    const encounters = QuestEncounterDoc.getEncounters(store, chamberSlug, realmCoord)
    let result = []
    Object.keys(encounters).forEach((timestamp, index) => {
      const description = QuestEncounterDoc.getDescription(store, timestamp)
      result.push(<option key={timestamp.toString()} value={timestamp}>{description}</option>)
    })
    return result
  }, [realmCoord, chamberSlug])

  return (
    <Select
      value={selectedValue ?? ''}
      placeholder='select encounter...'
      onChange={(e) => onChange(e.target.value)}
    >
      {options}
    </Select>
  )
}

const ModalQuestAgent = ({
  disclosure,
}) => {
  const { keysAreOk } = useKeys()
  const { isOpen, onOpen, onClose } = disclosure
  const { slug } = useSlugs()
  const { metadataStore } = useRoomContext()
  const { profileName } = useProfile(null)
  const [selectedEncounter, setSelectedEncounter] = useState('')

  useEffect(() => {
    if (isOpen) {
    }
  }, [isOpen])

  const encounter = useMetadataDocument('questEncounter', selectedEncounter?.toString() ?? '')
  // console.log(`ENCOUNTER:`, encounter, JSON.parse(encounter.history))

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
                  <Tab _selected={{ bg: 'teal' }}>New Encounter</Tab>
                }
                <Tab _selected={{ bg: 'teal' }}>Past Encounters</Tab>
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
                  <EncounterSelector
                    store={metadataStore}
                    realmCoord={1n}
                    chamberSlug={slug}
                    selectedValue={selectedEncounter}
                    onChange={(timestamp) => setSelectedEncounter(timestamp)}
                  />
                  {encounter &&
                    <div className='ScrollContainer QuestChatBody QuestHistory'>
                      <div className='ScrollContent'>
                        <ChatMessages
                          timestamp={selectedEncounter}
                          history={JSON.parse(encounter.history)}
                          agentName={encounter.agentName}
                          playerName={encounter.playerName}
                        />

                      </div>
                    </div>
                  }
                </TabPanel>
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
