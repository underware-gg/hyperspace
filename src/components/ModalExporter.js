import React, { useMemo, useState, useEffect } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  Spacer,
  HStack,
} from '@chakra-ui/react'
import { exportCrdtData, exportDataTypes, isCrdtData } from '@/core/export-import'
import { useRoomContext } from '@/hooks/RoomContext'
import usePermission from '@/hooks/usePermission'
import Snapshot from '@/components/Snapshot'
import Button from '@/components/Button'
// Verida
import { VeridaConnectMenu, VeridaStoreButton } from '@/components/Verida'
import { useVeridaContext } from '@/hooks/VeridaContext'
// NFT
import { ConnectKitButton } from 'connectkit'
import MintButton from '@/web3/components/MintButton'
import UpdateButton from '@/web3/components/UpdateButton'
import StateSelector from '@/web3/components/StateSelector'


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
              <Tab _selected={{ bg: 'teal' }}>Archive Snapshot</Tab>
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
                <VeridaExporterTab
                  slug={slug}
                  canEdit={canEdit}
                  data={data}
                  isCrdtExport={isCrdtExport}
                  handleClose={handleClose}
                />
              </TabPanel>

              <TabPanel>
                <NFTExporterTab
                  canEdit={canEdit}
                  data={data}
                  isCrdtExport={isCrdtExport}
                  handleClose={handleClose}
                />
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
              Download {isCrdtExport ? 'Archive' : 'Selected Data Types'}
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

const VeridaExporterTab = ({
  slug = null,
  canEdit = false,
  data = null,
  isCrdtExport = false,
  handleClose,
}) => {
  const dataId = useMemo(() => ((data && slug) ? `${slug}${isCrdtExport ? '' : ':data'}` : null), [data, isCrdtExport])

  const { veridaIsConnected, dispatchVerida, requestedConnect } = useVeridaContext()
  const [status, setStatus] = useState(null)
  useEffect(() => {
    if (requestedConnect) {
      handleClose(false)
    }
  }, [requestedConnect])
  useEffect(() => {
    setStatus(null)
  }, [data])

  return (
    <HStack>
      <VeridaConnectMenu disconnectButton={true} />
      <VeridaStoreButton disabled={!canEdit}
        label={`Save ${isCrdtExport ? 'Archive' : 'Data'}`}
        id={dataId} data={data}
        onSaving={() => setStatus('Saving...')}
        onSaved={(success) => setStatus(success ? 'Saved!' : 'Error!')}
      />
      <div>as <b className='Important'>{dataId}</b> {status}</div>
    </HStack>
  )
}


const NFTExporterTab = ({
  canEdit = false,
  data = null,
  handleClose,
}) => {
  const [status, setStatus] = useState(null)
  const [tokenId, setTokenId] = useState(null)

  return (
    <HStack>
      <ConnectKitButton />

      <MintButton
        data={data}
        disabled={!canEdit}
        label='Mint NFT'
        onStatusChanged={setStatus}
      />
      <UpdateButton
        tokenId={tokenId}
        data={data}
        disabled={!canEdit}
        label='Update NFT'
        onStatusChanged={setStatus}
      />

      <StateSelector
        selectedValue={tokenId}
        disabled={!canEdit}
        onSelected={setTokenId}
      />
      <div>{status}</div>
    </HStack>
  )
}
