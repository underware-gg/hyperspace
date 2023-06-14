import React, { useEffect } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  Text,
} from '@chakra-ui/react'
import { useRoomContext } from '@/hooks/RoomContext'
import Snapshot from '@/components/Snapshot'
import SnapshotSlug from '@/components/SnapshotSlug'
import Button from '@/components/Button'

const ModalSnapshots = ({
  disclosure,
}) => {
  const {
    remoteStore, localStore, sessionStore, agentStore, metadataStore,
    slug, slugSession, slugAgent, slugMetadata,
  } = useRoomContext()
  const { id, isOpen, onClose } = disclosure

  return (
    <Modal
      // initialFocusRef={initialRef}
      // finalFocusRef={finalRef}
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size='xl'
    >
      <ModalOverlay />
      <ModalContent
        maxW='50rem'
        backgroundColor='#000a'
      >
        <ModalHeader>
          Snapshot Explorer (by type)
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4} minHeight='300px'>
          <Tabs defaultIndex={1} isFitted variant='enclosed'>
            <TabList mb='1em'>
              <Tab _selected={{ bg: 'teal' }}>Local</Tab>
              <Tab _selected={{ bg: 'teal' }}>Remote</Tab>
              <Tab _selected={{ bg: 'teal' }}>Session</Tab>
              {process.env.DEV && <Tab _selected={{ bg: 'teal' }}>Agents</Tab>}
              {slugMetadata && <Tab _selected={{ bg: 'teal' }}>Metadata</Tab>}
              <Tab _selected={{ bg: 'teal' }}>Slug</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Snapshot store={localStore} />
              </TabPanel>
              <TabPanel>
                <Text>[<span className='Important'>{slug}</span>]</Text>
                <Snapshot store={remoteStore} />
              </TabPanel>
              <TabPanel>
                <Text>[<span className='Important'>{slugSession}</span>]</Text>
                <Snapshot store={sessionStore} />
              </TabPanel>
              {process.env.DEV &&
                <TabPanel>
                  <Text>[<span className='Important'>{slugAgent}</span>]</Text>
                  <Snapshot store={agentStore} />
                </TabPanel>
              }
              {slugMetadata &&
                <TabPanel>
                  <Text>[<span className='Important'>{slugMetadata}</span>]</Text>
                  <Snapshot store={metadataStore} />
                </TabPanel>
              }
              <TabPanel>
                <SnapshotSlug />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
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

export default ModalSnapshots
