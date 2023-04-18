import React, { useEffect, useMemo, useState } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  VStack, HStack,
  Spacer,
  Text,
} from '@chakra-ui/react'
import { isCrdtData, importCrdtData } from '@/core/export-import'
import { useRoomContext } from '@/hooks/RoomContext'
import usePermission from '@/hooks/usePermission'
import FileSelectButton from '@/components/FileSelectButton'
import Button from '@/components/Button'
import * as CrawlerData from '@rsodre/crawler-data'
const BN = require('bn.js');


const ImporterPreview = ({
  data = null,
  isCrdt,
}) => {
  return (
    <div>
      {data === false && <div>BAD DATA</div>}
      {data == null && <div>No Data</div>}
      {data &&
        <div>
          (preview data)
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

  const [data, setData] = useState(null)
  const isCrdt = useMemo(() => isCrdtData(data), [data])

  useEffect(() => {
    setData(null)
  }, [isOpen])

  const _uploadRoomData = (fileObject) => {
    const reader = new FileReader()
    reader.onload = (e2) => {
      try {
        setData(JSON.parse(e2.target.result))
      } catch (e) {
        setData(false)
        console.warn(`IMPORT ERROR:`, e)
      }
    }
    reader.readAsText(fileObject)
  }

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

  const _importSelected = () => {
    if (!data) return
  }

  const _importCrdt = () => {
    if (!importCrdtData(data, remoteStore)) return
    handleClose(false)
    // TODO: move to Entry
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
                <FileSelectButton
                  disabled={!canEdit}
                  label='Select File'
                  id='upload-room-data'
                  accept='.json'
                  onSelect={(fileObject) => _uploadRoomData(fileObject)}
                />
              </TabPanel>
              <TabPanel>
                <Button disabled={true}>todo</Button>
              </TabPanel>
              <TabPanel>
                <Button disabled={true}>todo</Button>
              </TabPanel>
              <TabPanel>
                <Button disabled={true}>todo</Button>
              </TabPanel>
            </TabPanels>
          </Tabs>

          <hr className='Margin' />
          <ImporterPreview data={data} isCrdt={isCrdt} />

        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            fullWidth
            value="Close"
            onClick={handleClose}
          />
          <Spacer />

          <Button
            disabled={!canEdit || !data}
            // variant='outline'
            size='sm'
            onClick={() => (isCrdt ? _importCrdt : _importSelected)()}
          >
            Import {isCrdt ? 'CRDT' : 'Selected'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalImporter
