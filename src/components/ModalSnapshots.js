import React, { useEffect } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel,
} from '@chakra-ui/react'
import { getRemoteStore, getLocalStore } from '@/core/singleton'
import { useDocument } from '@/hooks/useDocument'
import Snapshot from '@/components/Snapshot'
import SnapshotSlug from '@/components/SnapshotSlug'
import Button from '@/components/Button'

const remoteStore = getRemoteStore()
const localStore = getLocalStore()

const ModalSnapshots = ({
  disclosure,
}) => {
  const { id, isOpen, onClose } = disclosure

  const settings = useDocument('settings', id)

  useEffect(() => {
  }, [])

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
          <Tabs isFitted variant='enclosed'>
            <TabList mb='1em'>
              <Tab _selected={{ bg: 'teal' }}>Remote</Tab>
              <Tab _selected={{ bg: 'teal' }}>Local</Tab>
              <Tab _selected={{ bg: 'teal' }}>Slug</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Snapshot store={remoteStore} />
              </TabPanel>
              <TabPanel>
                <Snapshot store={localStore} />
              </TabPanel>
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
