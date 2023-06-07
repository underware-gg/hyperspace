import React, { useEffect, useMemo, useState } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  VStack, HStack,
  Spacer,
  Text,
  Input,
} from '@chakra-ui/react'
import { isCrdtData, importCrdtData, importDataTypes } from '@/core/export-import'
import { useRoomContext } from '@/hooks/RoomContext'
import usePermission from '@/hooks/usePermission'
import RequestSignInButton from '@/components/RequestSignInButton'
import FileSelectButton from '@/components/FileSelectButton'
import Button from '@/components/Button'
import Snapshot from '@/components/Snapshot'
import Store from '@/core/store'
// Verida
import { VeridaRestoreButton } from '@/components/Verida'
import { useVeridaContext } from '@/hooks/VeridaContext'
// NFT
import { useAccount } from 'wagmi'
import { useHyperboxState } from '@/web3/hooks/useHyperboxState'
import StateSelector from '@/web3/components/StateSelector'
// Crawler
import * as Crawler from '@rsodre/crawler-data'
import { crawlerSlugToChamberData, crawlerSlugToRoom } from '@/core/crawler'

const useImportedData = (data) => {
  const [store, setStore] = useState(null)

  useEffect(() => {
    if (isCrdtData(data)) {
      const _store = new Store()
      if (importCrdtData(data, _store, false)) {
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
  onTypesSelected = (types) => { },
}) => {
  const isCrdt = useMemo(() => isCrdtData(data), [data])
  const { store } = useImportedData(data)
  return (
    <div>
      {data === false && <div>Bad data!!!</div>}
      {data == null && <div>No data selected</div>}
      {data &&
        <div>
          {isCrdt && <div>Preview (Archive Snapshot)</div>}
          {!isCrdt && <div>Preview (Data Types)</div>}
          <div>
            {store
              ? <Snapshot store={store} expanded={false} height='250px' onTypesSelected={onTypesSelected} />
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
  const { slug, remoteStore, agentId, Player, Tileset } = useRoomContext()
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

  const [selectedTypes, setSelectedTypes] = useState([])
  useEffect(() => {
    // console.log(`types:`, selectedTypes)
  }, [selectedTypes])

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
    setTokenId(null)
  }, [isOpen])

  const _canImportArchive = (canEdit && data && isCrdt)
  const _canImportData = (canEdit && data && !isCrdt && selectedTypes.length > 0)

  const _importCrdt = (replaceData) => {
    setImportStatus(importCrdtData(data, remoteStore, replaceData))
  }

  const _importData = (replaceData) => {
    const _data = Object.keys(data).reduce((result, key) => (
      selectedTypes.includes(key) ? { ...result, [key]: data[key] } : result
    ), {})
    setImportStatus(importDataTypes(_data, remoteStore, replaceData))
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

  const { veridaIsConnected, requestedSignIn } = useVeridaContext()
  useEffect(() => {
    if (requestedSignIn) {
      handleClose(false)
    }
  }, [requestedSignIn])

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
  const { isConnected } = useAccount()
  const [tokenId, setTokenId] = useState(null)
  const { state, isLoading, isSuccess, isError, error } = useHyperboxState(tokenId)
  useEffect(() => {
    _setRestoredData(tokenId, isSuccess ? state : null)
  }, [state, isSuccess, isError])

  //
  // Endless Crawler
  const [crawlerSlug, setCrawlerSlug] = useState('')
  useEffect(() => {
    if (isOpen) setCrawlerSlug('')
  }, [isOpen])
  const _importCrawlerChamber = () => {
    const chamber = crawlerSlugToRoom(crawlerSlug)
    if (chamber) {
      // update map
      remoteStore.setDocument('map2', 'world', chamber.map)
      // update entry
      let settings = remoteStore.getDocument('settings', 'world')
      settings.entry = chamber.entry
      remoteStore.setDocument('settings', 'world', settings)
      // move player
      Player.moveToTile(agentId, chamber.entry.x, chamber.entry.y)
      // switch tileset
      Tileset.updateTileset('world', chamber.tileset, 32, 32, null)
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
                  {!veridaIsConnected &&
                    <RequestSignInButton label='Sign In with Verida' />
                  }

                  <VeridaRestoreButton disabled={!canEdit}
                    label='Restore Archive'
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
                  {!isConnected &&
                    <RequestSignInButton label='Connect Wallet' />
                  }

                  {/* <Button disabled={!canEdit} variant={data && !filenames[2] ? 'outline' : null}>Restore from State NFT</Button> */}

                  <Text>State Token Id:</Text>
                  <StateSelector
                    selectedValue={tokenId}
                    disabled={!canEdit || !isConnected}
                    onSelected={setTokenId}
                  />
                  <div>{filenames[2]}</div>
                </HStack>
              </TabPanel>

              <TabPanel className='NoPadding'>
                <HStack>
                  <Button
                    disabled={!canEdit || !Crawler.validateSlug(crawlerSlug)}
                    variant={data && !filenames[3] ? 'outline' : null}
                    onClick={() => _importCrawlerChamber()}
                  >Import Endless Crawler Map</Button>
                  <Input w={100}
                    value={crawlerSlug}
                    onChange={(e) => setCrawlerSlug(e.target.value)}
                    onKeyDown={(e) => { if (e.code == 'Enter') _importCrawlerChamber() }}
                  />
                  <div>{filenames[3]}</div>
                </HStack>
              </TabPanel>
            </TabPanels>
          </Tabs>

          <hr className='HR' />
          <ImporterPreview data={data} onTypesSelected={setSelectedTypes} />

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
            <Button size='sm' disabled={!_canImportArchive} onClick={() => _importCrdt(true)}>
              Replace Archive
            </Button>
            <Button size='sm' disabled={!_canImportArchive} onClick={() => _importCrdt(false)}>
              Merge Archive
            </Button>
          </HStack>
          <Spacer />

          <HStack>
            <Button size='sm' disabled={!_canImportData} onClick={() => _importData(true)}>
              Replace Data
            </Button>
            <Button size='sm' disabled={!_canImportData} onClick={() => _importData(false)}>
              Merge Data
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalImporter
