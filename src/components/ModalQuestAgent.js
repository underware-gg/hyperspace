import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  Spacer,
  HStack,
  Select,
  Divider,
} from '@chakra-ui/react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useSlugs } from '@/hooks/useSlugs'
import { QuestEncounterDoc, QuestRealmDoc } from 'hyperbox-sdk'
import { useMetadataDocument } from '@/hooks/useDocument'
import { useMetadataDocumentIds } from '@/hooks/useDocumentIds'
import { ChatDialog, ChatMessages, OpenAISetup, useKeys } from 'endlessquestagent'
import useProfile from '@/hooks/useProfile'
import { Button } from '@/components/Button'
import { makeRoute } from '@/core/utils/routes'
import { useMetadata } from '@/hooks/useMetadata'


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
  const router = useRouter()
  const { keysAreOk } = useKeys()
  const { isOpen, onOpen, onClose } = disclosure
  const { slug, realmCoord, isQuest } = useSlugs()
  const { metadataStore } = useRoomContext()
  const { profileName } = useProfile(null)
  const [selectedEncounter, setSelectedEncounter] = useState('')

  useEffect(() => {
    if (isOpen) {
    }
  }, [isOpen])

  const { metadata } = useMetadata()

  const encounter = useMetadataDocument(QuestEncounterDoc.type, selectedEncounter?.toString() ?? '')
  // console.log(`ENCOUNTER:`, encounter, JSON.parse(encounter.history))

  const ids = useMetadataDocumentIds(QuestRealmDoc.type)

  // Move to Realm 1 if Realm do not exist
  useEffect(() => {
    if (router.isReady && slug && isQuest && ids.length > 0) {
      const realmDoc = metadataStore.getDocument(QuestRealmDoc.type, realmCoord)
      if ((!realmDoc || !realmCoord) && realmCoord != '1') {
        const url = makeRoute({
          slug,
          realmCoord: '1',
          isQuest,
        })
        console.log(`Invalid Quest Realm [${realmCoord}], move to Realm 1....`, url)
        router.replace(url)
      }
    }
  }, [router.isReady, slug, realmCoord, isQuest, ids])

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
                <Tab _selected={{ bg: 'teal' }}>New Encounter</Tab>
                <Tab _selected={{ bg: 'teal' }}>Past Encounters</Tab>
                <Tab _selected={{ bg: 'teal' }}>Setup</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  {keysAreOk ?
                    <>
                      {metadata?.realm && 
                      <HStack className='Important'>
                        <div className='QuestRealmArt'>
                          <img src={metadata.realm.artUrl} />
                        </div>
                        <div>
                          {metadata.realm.name}
                        </div>
                        </HStack>
                      }
                      <Divider h='10px' />
                      <ChatDialog
                        store={metadataStore}
                        realmCoord={1n}
                        chamberSlug={slug}
                        isChatting={true}
                        onStopChatting={onClose}
                        playerName={profileName}
                      />
                    </>
                    : <h5>Setup OpenAI keys first</h5>
                  }
                </TabPanel>
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
