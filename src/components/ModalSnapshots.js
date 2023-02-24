import React, { useState, useEffect, useMemo } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  HStack,
  Text,
  Box,
} from '@chakra-ui/react'
import { DownloadIcon } from '@chakra-ui/icons'
import { getRemoteStore, getLocalStore } from '@/core/singleton'
import { useDocument } from '@/hooks/useDocument'
import useDocumentIds from '@/hooks/useDocumentIds'
import Button from '@/components/Button'

const remoteStore = getRemoteStore()
const localStore = getLocalStore()

let _logged = false
const _log = (type, id, content) => {
  console.log(type, id, content)
  if (!_logged) {
    alert(`Document dumped to the console`)
    _logged = true
  }
}

const Type = ({
  store,
  type,
}) => {

  const ids = useDocumentIds(type, store)

  const items = useMemo(() => {
    let result = []
    for (const id of ids) {
      const doc = store.getDocument(type, id)
      const name = doc.name ?? doc.slug ?? doc?.id ?? null
      const content = doc.content ? doc.content.slice(0,20) : null
      result.push(
        <HStack key={id}>
          <DownloadIcon boxSize='0.8em' className='Clickable' onClick={() => _log(type, id, doc)} />
          <Text>
            {id}
            {name && ` (${name})`}
            {content && ` : ${content}...`}
          </Text>
        </HStack>
      )
    }
    return result
  }, [ids])

  return (
    <AccordionItem className='AccordionItem'>
      <AccordionButton style={{
        height: '1.5em'
      }}>
        <Box as="span" flex='1' textAlign='left'>
          {type} ({items.length})
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel style={{
        backgroundColor: '#fff2'
      }}>
        {items}
      </AccordionPanel>
    </AccordionItem>
  )
}

const Snapshot = ({
  store,
}) => {
  const types = useMemo(() => {
    let result = []
    const types = store.getTypes()
    for (const type of types) {
      result.push(
        <Type key={type} store={store} type={type} />
      )
    }
    return result
  }, [])

  return (
    <Box overflowY='scroll' height='400px' maxH='400px'>
      <Accordion allowMultiple>
        {types}
      </Accordion>
    </Box>
  )
}

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
            </TabList>
            <TabPanels>
              <TabPanel>
                <Snapshot store={remoteStore} />
              </TabPanel>
              <TabPanel>
                <Snapshot store={localStore} />
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
