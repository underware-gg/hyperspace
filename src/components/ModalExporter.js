import React, { useMemo, useState } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  Spacer,
} from '@chakra-ui/react'
import { exportCrdtData, exportTypes } from '@/core/export-import'
import { useRoomContext } from '@/hooks/RoomContext'
import usePermission from '@/hooks/usePermission'
import Snapshot from '@/components/Snapshot'
import Button from '@/components/Button'


const ModalExporter = ({
  isOpen,
  handleClose,
}) => {
  const { remoteStore, clientRoom, slug } = useRoomContext()
  const { canEdit } = usePermission('world')

  const [tabIndex, setTabIndex] = useState(0)
  const isSelectiveExport = useMemo(() => (tabIndex == 0), [tabIndex])
  const isFullExport = useMemo(() => (tabIndex == 1), [tabIndex])

  const [selectedTypes, setSelectedTypes] = useState([])

  const data = useMemo(() => {
    if (isFullExport) {
      return exportCrdtData(clientRoom)
    }
    if (isSelectiveExport) {
      return exportTypes(selectedTypes, remoteStore)
    }
    return null
  }, [slug, clientRoom, isFullExport, isSelectiveExport, selectedTypes])
  
  const dataSize = useMemo(() => (data ? JSON.stringify(data).length : 0), [data])

  const _download = () => {
    if (!data) return
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`
    const dlAnchor = document.getElementById('download-room-data')
    dlAnchor.setAttribute('href', dataStr)
    dlAnchor.setAttribute('download', `room-${slug}.json`)
    dlAnchor.click()
  }

  return (
    <Modal
      // initialFocusRef={initialRef}
      // finalFocusRef={finalRef}
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
      size='lg'
    >
      <ModalOverlay />
      <ModalContent
        maxW='40rem'
        backgroundColor='#000a'
      >
        <ModalHeader>
          Export Data
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4} minHeight='300px'>
          <Tabs isFitted variant='enclosed'
            defaultIndex={tabIndex}
            onChange={(index) => setTabIndex(index)}
          >
            <TabList mb='1em'>
              <Tab _selected={{ bg: 'teal' }}>Selective</Tab>
              <Tab _selected={{ bg: 'teal' }}>Full CRDT</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Snapshot store={remoteStore} expanded={false} onTypesSelected={setSelectedTypes} excludeTypes={['player', 'editor', 'profile']} />
              </TabPanel>
              <TabPanel>
                <Snapshot store={remoteStore} expanded={false} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            fullWidth
            value="Close"
            onClick={handleClose}
          />
          <Spacer />

          <a id='download-room-data' href='#' hidden></a>
          <Button
            disabled={!canEdit || !data}
            // variant='outline'
            size='sm'
            onClick={() => _download()}
          >
            Download
          </Button>
          &nbsp;
          {(dataSize/1000).toFixed(1)}K
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalExporter
