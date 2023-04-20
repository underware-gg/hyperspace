import React, { useMemo, useState, useEffect } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  Spacer,
  HStack,
} from '@chakra-ui/react'
import { exportCrdtData, exportDataTypes, isCrdtData } from '@/core/export-import'
import { useRoomContext } from '@/hooks/RoomContext'
import { useVeridaContext } from '@/hooks/VeridaContext'
import usePermission from '@/hooks/usePermission'
import Snapshot from '@/components/Snapshot'
import Button from '@/components/Button'
import { VeridaConnectMenu, VeridaStoreButton } from '@/components/Verida'


const ModalExporter = ({
  isOpen,
  handleClose,
}) => {
  const { remoteStore, clientRoom, slug } = useRoomContext()
  const { canEdit } = usePermission('world')

  const [tabIndex, setTabIndex] = useState(0)
  const isSelectiveExport = useMemo(() => (tabIndex == 0), [tabIndex])
  const isCrdtExport = useMemo(() => (tabIndex == 1), [tabIndex])

  const [selectedTypes, setSelectedTypes] = useState([])

  const data = useMemo(() => {
    if (isCrdtExport) {
      return exportCrdtData(clientRoom)
    }
    if (isSelectiveExport) {
      return selectedTypes.length > 0 ? exportDataTypes(selectedTypes, remoteStore) : null
    }
    return null
  }, [slug, clientRoom, isCrdtExport, isSelectiveExport, selectedTypes])

  const dataSize = useMemo(() => (data ? JSON.stringify(data).length : 0), [data])
  const dataId = useMemo(() => (data ? `${slug}${isCrdtExport ? '' : ':data'}` : null), [data])

  //
  // Verida
  const { veridaIsConnected, dispatchVerida, requestedConnect } = useVeridaContext()
  const [veridaStatus, setVeridaStatus] = useState(null)
  useEffect(() => {
    if (requestedConnect) {
      handleClose(false)
    }
  }, [requestedConnect])
  useEffect(() => {
    setVeridaStatus(null)
  }, [data])


  //
  // Download
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
              <Tab _selected={{ bg: 'teal' }}>CRDT Snapshot</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Snapshot store={remoteStore} expanded={false} height='250px' onTypesSelected={setSelectedTypes} excludeTypes={['player', 'editor', 'profile']} />
              </TabPanel>
              <TabPanel>
                <Snapshot store={remoteStore} expanded={false} height='250px' />
              </TabPanel>
            </TabPanels>
          </Tabs>

          <Tabs isFitted variant='enclosed'>
            <TabList mb='1em'>
              <Tab _selected={{ bg: 'teal' }}>Verida</Tab>
              <Tab _selected={{ bg: 'teal' }}>State NFT</Tab>
              <Tab _selected={{ bg: 'teal' }}>Download</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <HStack>
                  <VeridaConnectMenu disconnectButton={true} />
                  <VeridaStoreButton disabled={!canEdit}
                    label={`Save ${isCrdtExport ? 'CRDT' : 'Data'}`}
                    id={dataId} data={data}
                    onSaving={() => setVeridaStatus('Saving...')}
                    onSaved={(success) => setVeridaStatus(success ? 'Saved!' : 'Error!')}
                  />
                  <div>as <b className='Important'>{dataId}</b> {veridaStatus}</div>
                </HStack>
              </TabPanel>

              <TabPanel>
                <HStack>
                  <Button size='sm' disabled={true} onClick={() => { }}>
                    Mint NFT
                  </Button>
                  <Button size='sm' disabled={true} onClick={() => { }}>
                    Select NFT
                  </Button>
                </HStack>
              </TabPanel>

              <TabPanel>
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

          <HStack>
            <a id='download-room-data' href='#' hidden></a>
            <Button size='sm' disabled={!canEdit || !data} onClick={() => _download()}>
              Download {isCrdtExport ? 'CRDT' : 'Selected Data Types'}
            </Button>
            <div>
              {(dataSize / 1000).toFixed(1)}K
            </div>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalExporter
