import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { HStack } from '@chakra-ui/react'
import Button from 'components/button'
import FileSelectButton from 'components/file-select-button'
import { getLocalStore, getRemoteStore } from 'core/singleton'
import * as ClientRoom from 'core/networking'

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

  return (
    <HStack>
      <a id='download-room-data' href='#' hidden></a>
      <Button variant='outline' size='sm' onClick={() => _downloadRoomData(slug)}>
        Download Room Data
      </Button>
      <FileSelectButton
        label='Upload Room Data'
        id='upload-room-data'
        accept='.json'
        onSelect={(fileObject) => _uploadRoomData(fileObject)}
      />
    </HStack>
  )
}

export default RoomDownloadMenu
