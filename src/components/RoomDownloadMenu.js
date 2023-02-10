import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { HStack } from '@chakra-ui/react'
import { getLocalStore, getRemoteStore } from '@/core/singleton'
import usePermission from '@/hooks/usePermission'
import Button from '@/components/Button'
import FileSelectButton from '@/components/FileSelectButton'
import * as ClientRoom from '@/core/networking'
import * as CrawlerData from '@rsodre/crawler-data'
import * as Map from '@/core/components/map'
const BN = require('bn.js');

const _downloadRoomData = (slug) => {
  const room = ClientRoom.get()
  if (room === null) {
    return
  }
  const snapshotOps = room.getSnapshotOps()
  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(snapshotOps))}`
  const dlAnchor = document.getElementById('download-room-data')
  dlAnchor.setAttribute('href', dataStr)
  dlAnchor.setAttribute('download', `room-${slug}.json`)
  dlAnchor.click()
}

const RoomDownloadMenu = () => {
  const router = useRouter()
  const { slug } = router.query

  const { canEdit } = usePermission('world')

  const _uploadRoomData = (fileObject) => {
    const reader = new FileReader()
    reader.onload = (e2) => {
      const json = JSON.parse(e2.target.result)
      const remoteStore = getRemoteStore()
      for (const op of json) {
        if (op.pathIndex === 0) {
          const { type, key, value } = op
          remoteStore.setDocument(type, key, value)
        }
      }
    }
    reader.readAsText(fileObject)
  }

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
            const bit = bitmap.and(new BN('1').shln(255-i)).eq(new BN('0')) ? 0 : 1
            Map.update('world', x, y, bit ? 8 : 5)
          }
        }
        return
      }
    }
  }

  return (
    <HStack>
      <a id='download-room-data' href='#' hidden></a>
      <Button
        disabled={!canEdit}
        variant='outline'
        size='sm'
        onClick={() => _downloadRoomData(slug)}
      >
        Download Room Data
      </Button>
      <FileSelectButton
        disabled={!canEdit}
        label='Upload Room Data'
        id='upload-room-data'
        accept='.json'
        onSelect={(fileObject) => _uploadRoomData(fileObject)}
      />
      <Button
        disabled={!canEdit}
        variant='outline'
        size='sm'
        onClick={() => _importCrawlerChamber()}
      >
        Import Crawler Chamber
      </Button>
    </HStack>
  )
}

export default RoomDownloadMenu
