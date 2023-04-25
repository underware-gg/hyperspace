import React, { useEffect, useMemo, useState } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  VStack, HStack,
  Spacer,
  Text,
} from '@chakra-ui/react'
import { isCrdtData, importCrdtData, importDataTypes } from '@/core/export-import'
import { useRoomContext } from '@/hooks/RoomContext'
import usePermission from '@/hooks/usePermission'
import FileSelectButton from '@/components/FileSelectButton'
import Button from '@/components/Button'
import Snapshot from '@/components/Snapshot'
import Store from '@/core/store'
// Verida
import { VeridaConnectMenu, VeridaRestoreButton } from '@/components/Verida'
// NFT
import { useAccount } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { useHyperboxState } from '@/web3/hooks/useHyperboxState'
import StateSelector from '@/web3/components/StateSelector'

// Crawler
import * as CrawlerData from '@rsodre/crawler-data'
const BN = require('bn.js');

const useImportedData = (data) => {
  const [store, setStore] = useState(null)

  useEffect(() => {
    if (isCrdtData(data)) {
      const _store = new Store()
      if (importCrdtData(data, _store)) {
        setStore(_store)
        return
      }
    } else {
      const _store = new Store()
      if (importDataTypes(data, _store)) {
        setStore(_store)
        return
      }
    }
    setStore(null)
  }, [data])

  return {
    store,
  }
}

const ImporterPreview = ({
  data = null,
}) => {
  const isCrdt = useMemo(() => isCrdtData(data), [data])
  const { store } = useImportedData(data)
  return (
    <div>
      {data === false && <div>Bad data!!!</div>}
      {data == null && <div>No data selected</div>}
      {data &&
        <div>
          {isCrdt && <div>Preview (CRDT Snapshot)</div>}
          {!isCrdt && <div>Preview (Data Types)</div>}
          <div>
            {store
              ? <Snapshot store={store} expanded={false} height='250px' />
              : <div>(Preview not available)</div>
            }
          </div>
        </div>
      }
    </div>
  )
}

const ModalImporter = ({
  isOpen,
  handleClose,
}) => {
  const { remoteStore, clientRoom, slug } = useRoomContext()
  const { canEdit } = usePermission('world')

  const [tabIndex, setTabIndex] = useState(0)
  const isUpload = useMemo(() => (tabIndex == 0), [tabIndex])
  const isVerida = useMemo(() => (tabIndex == 1), [tabIndex])
  const isNFT = useMemo(() => (tabIndex == 2), [tabIndex])
  const isCrawler = useMemo(() => (tabIndex == 3), [tabIndex])

  const [filenames, setFilenames] = useState([null, null, null, null])
  const _setCurrentTabFilename = (filename) => {
    let filenames = [null, null, null, null]
    filenames[tabIndex] = filename
    setFilenames(filenames)
  }
  const [data, setData] = useState(null)
  const isCrdt = useMemo(() => isCrdtData(data), [data])

  const [importStatus, setImportStatus] = useState(false)
  useEffect(() => {
    if (importStatus) {
      handleClose(false)
      // TODO: move to Entry
    }
  }, [importStatus])

  // initialize
  useEffect(() => {
    _setCurrentTabFilename(null)
    setImportStatus(false)
    setData(null)
  }, [isOpen])

  const _importCrdt = (replaceData) => {
    setImportStatus(importCrdtData(data, remoteStore, replaceData))
  }

  const _importData = (replaceData) => {
    setImportStatus(importDataTypes(data, remoteStore, replaceData))
  }

  const _setRestoredData = (id, data) => {
    _setCurrentTabFilename(id)
    if (data) {
      try {
        setData(JSON.parse(data))
      } catch (e) {
        setData(false)
        console.warn(`BAD DATA:`, e)
      }
    } else {
      setData(null)
    }
  }

  //
  // Upload
  const _uploadRoomData = (fileObject) => {
    if (!fileObject) return
    const reader = new FileReader()
    reader.onload = (e2) => {
      _setRestoredData(fileObject?.name ?? null, e2.target.result)
    }
    reader.readAsText(fileObject)
  }

  //
  // NFT
  const [tokenId, setTokenId] = useState(null)
  const { state, isLoading, isSuccess, isError, error } = useHyperboxState(tokenId)
  useEffect(() => {
    console.log(isSuccess, isError, state)
    _setRestoredData(tokenId, isSuccess ? state : null)
  }, [state, isSuccess, isError])
  //
  // Crawler
  // TODO: Review and fix!
  const _importCrawlerChamber = () => {
    const slug = window.prompt('DID to invite', 'S1W1')
    if (!slug) return
    for (let tokenId = 1; tokenId <= CrawlerData.getChamberCount(); ++tokenId) {
      const coords = CrawlerData.getTokenIdToCoords(tokenId)
      if (coords.slug == slug) {
        const chamberData = CrawlerData.getChamberData(coords.coord)
        // console.log(chamberData)
        const bitmap = new BN(chamberData.bitmap.slice(2), 16)
        for (let x = 0; x < 16; ++x) {
          for (let y = 0; y < 15; ++y) {
            const i = y * 16 + x
            const bit = bitmap.and(new BN('1').shln(255 - i)).eq(new BN('0')) ? 0 : 1
            map.updateTile('world', x, y, bit ? 8 : 5)
          }
        }
        return
      }
    }
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
          Import Data
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4} minHeight='300px'>
          <Tabs isFitted variant='enclosed'
            defaultIndex={tabIndex}
            onChange={(index) => setTabIndex(index)}
          >
            <TabList mb='1em'>
              <Tab _selected={{ bg: 'teal' }}>Upload</Tab>
              <Tab _selected={{ bg: 'teal' }}>Verida</Tab>
              <Tab _selected={{ bg: 'teal' }}>State NFT</Tab>
              <Tab _selected={{ bg: 'teal' }}>Crawler</Tab>
            </TabList>
            <TabPanels>
              <TabPanel className='NoPadding'>
                <HStack>
                  <FileSelectButton
                    id='upload-room-data'
                    label='Select File'
                    accept='.json'
                    disabled={!canEdit}
                    variant={data && !filenames[0] ? 'outline' : null}
                    onSelect={(fileObject) => _uploadRoomData(fileObject)}
                  />
                  <div>{filenames[0]}</div>
                </HStack>
              </TabPanel>

              <TabPanel className='NoPadding'>
                <HStack>
                  <VeridaConnectMenu disconnectButton={true} connectLabel='Connect' disconnectLabel='Disconnect' />
                  <VeridaRestoreButton disabled={!canEdit}
                    label='Restore CRDT'
                    id={slug}
                    onRestored={(id, data) => _setRestoredData(id, data)}
                  />

                  <VeridaRestoreButton disabled={!canEdit}
                    label='Restore Data'
                    id={`${slug}:data`}
                    onRestored={(id, data) => _setRestoredData(id, data)}
                  />

                  <div>{filenames[1]}</div>
                </HStack>
              </TabPanel>

              <TabPanel className='NoPadding'>
                <HStack>
                  <ConnectKitButton />
                  {/* <Button disabled={!canEdit} variant={data && !filenames[2] ? 'outline' : null}>Restore from State NFT</Button> */}
                  <StateSelector
                    selectedValue={tokenId}
                    disabled={!canEdit}
                    onSelected={setTokenId}
                  />
                  <div>{filenames[2]}</div>
                </HStack>
              </TabPanel>

              <TabPanel className='NoPadding'>
                <HStack>
                  <Button disabled={!canEdit} variant={data && !filenames[3] ? 'outline' : null}>Import Endless Crawler Map</Button>
                  <div>{filenames[3]}</div>
                </HStack>
              </TabPanel>
            </TabPanels>
          </Tabs>

          <hr className='HR' />
          <ImporterPreview data={data} />

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
            <Button size='sm' disabled={!canEdit || !data || !isCrdt} onClick={() => _importCrdt(true)}>
              Replace CRDT
            </Button>
            <Button size='sm' disabled={!canEdit || !data || !isCrdt} onClick={() => _importCrdt(false)}>
              Merge CRDT
            </Button>
          </HStack>
          <Spacer />

          <HStack>
            <Button size='sm' disabled={!canEdit || !data || isCrdt} onClick={() => _importData(true)}>
              Replace Data
            </Button>
            <Button size='sm' disabled={!canEdit || !data || isCrdt} onClick={() => _importData(false)}>
              Merge Data
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalImporter